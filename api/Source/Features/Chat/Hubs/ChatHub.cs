using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using MediatR;
using Source.Features.Chat.Commands;

namespace Source.Features.Chat.Hubs;

/// <summary>
/// SignalR Hub for real-time chat functionality
/// Part of the Chat feature vertical slice
/// NOTE: Anonymous access allowed for demo purposes
/// </summary>
public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;
    private readonly IMediator _mediator;
    private static readonly Dictionary<string, string> ConnectedUsers = new();

    public ChatHub(ILogger<ChatHub> logger, IMediator mediator)
    {
        _logger = logger;
        _mediator = mediator;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("🔌 Connection established: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Get username before removing from tracking
        var userName = ConnectedUsers.TryGetValue(Context.ConnectionId, out var storedUsername) 
            ? storedUsername 
            : "Anonymous";
        
        // Clean up connection tracking
        ConnectedUsers.Remove(Context.ConnectionId);
        
        _logger.LogInformation("❌ User disconnected from chat: {UserName} (ID: {ConnectionId})", userName, Context.ConnectionId);
        
        // Notify others that user left
        await Clients.Group("GeneralChat").SendAsync("UserLeft", new
        {
            UserId = Context.ConnectionId,
            UserName = userName,
            DisconnectedAt = DateTime.UtcNow // UTC timestamp
        });

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Set the username for this connection
    /// </summary>
    public async Task SetUsername(string username)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            await Clients.Caller.SendAsync("Error", "Username cannot be empty");
            return;
        }

        ConnectedUsers[Context.ConnectionId] = username;
        _logger.LogInformation("🏷️ Username set for connection {ConnectionId}: {Username}", Context.ConnectionId, username);
        
        // Join general chat room
        await Groups.AddToGroupAsync(Context.ConnectionId, "GeneralChat");
        
        // Notify others that user joined
        await Clients.Group("GeneralChat").SendAsync("UserJoined", new
        {
            UserId = Context.ConnectionId,
            UserName = username,
            ConnectedAt = DateTime.UtcNow // UTC timestamp
        });
    }

    /// <summary>
    /// Send a message to the general chat
    /// </summary>
    public async Task SendMessage(string message)
    {
        // Get username from our connection tracking
        var userName = ConnectedUsers.TryGetValue(Context.ConnectionId, out var storedUsername) 
            ? storedUsername 
            : "Anonymous";
        
        if (string.IsNullOrWhiteSpace(message))
        {
            await Clients.Caller.SendAsync("Error", "Message cannot be empty");
            return;
        }

        _logger.LogInformation("💬 Message from {UserName}: {Message}", userName, message);

        // Save message to database using CQRS command
        var saveResult = await _mediator.Send(new SaveChatMessage(
            UserName: userName,
            Message: message,
            ConnectionId: Context.ConnectionId,
            MessageType: "user",
            IsSystemMessage: false
        ));

        if (saveResult.IsFailure)
        {
            await Clients.Caller.SendAsync("Error", $"Failed to save message: {saveResult.Error}");
            return;
        }

        // Broadcast message to all users in general chat (including sender)
        // Always use UTC for timestamps - frontend will handle local display
        await Clients.All.SendAsync("ReceiveMessage", new
        {
            Id = saveResult.Value, // Use the actual saved message ID
            UserId = Context.ConnectionId,
            UserName = userName,
            Message = message,
            Timestamp = DateTime.UtcNow, // UTC timestamp
            Type = "user"
        });
    }

    /// <summary>
    /// Join a specific chat room (for future features)
    /// </summary>
    public async Task JoinRoom(string roomName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
        var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Anonymous";
        
        _logger.LogInformation("🏠 {UserName} joined room: {RoomName}", userName, roomName);
        
        await Clients.Group(roomName).SendAsync("UserJoinedRoom", new
        {
            UserName = userName,
            RoomName = roomName,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Leave a specific chat room
    /// </summary>
    public async Task LeaveRoom(string roomName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
        var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Anonymous";
        
        _logger.LogInformation("🚪 {UserName} left room: {RoomName}", userName, roomName);
    }

    /// <summary>
    /// Send typing indicator
    /// </summary>
    public async Task SendTyping()
    {
        var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Anonymous";
        
        await Clients.Others.SendAsync("UserTyping", new
        {
            UserName = userName,
            Timestamp = DateTime.UtcNow
        });
    }
} 