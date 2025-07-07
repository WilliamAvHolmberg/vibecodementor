using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Source.Features.Kanban.Hubs;

/// <summary>
/// SignalR Hub for real-time kanban board updates
/// Part of the Kanban feature vertical slice
/// </summary>
[Authorize] // JWT auth required
public class KanbanHub : Hub
{
    private readonly ILogger<KanbanHub> _logger;

    public KanbanHub(ILogger<KanbanHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Join a board-specific group for real-time updates
    /// </summary>
    public async Task JoinBoard(string boardId)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("🚫 Unauthorized SignalR connection attempted");
            throw new HubException("Unauthorized");
        }

        // TODO: Verify user has access to the board
        var groupName = $"Board_{boardId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        
        _logger.LogInformation("🔗 User {UserId} joined board {BoardId} group", userId, boardId);
    }

    /// <summary>
    /// Leave a board-specific group
    /// </summary>
    public async Task LeaveBoard(string boardId)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return;

        var groupName = $"Board_{boardId}";
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        
        _logger.LogInformation("🔗 User {UserId} left board {BoardId} group", userId, boardId);
    }

    /// <summary>
    /// Handle connection events
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        _logger.LogInformation("🔗 Kanban SignalR connection established for user {UserId}", userId);
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Handle disconnection events
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        _logger.LogInformation("🔗 Kanban SignalR connection closed for user {UserId}", userId);
        await base.OnDisconnectedAsync(exception);
    }
} 