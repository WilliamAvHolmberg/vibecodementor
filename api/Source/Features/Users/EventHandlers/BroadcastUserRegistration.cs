using Microsoft.AspNetCore.SignalR;
using Source.Features.Chat.Hubs;
using Source.Features.Users.Events;
using Source.Shared.Events;

namespace Source.Features.Users.EventHandlers;

/// <summary>
/// Event handler that broadcasts user registration to all connected clients via SignalR
/// This demonstrates Domain-Driven Design + Event-Driven Architecture + Real-time notifications
/// </summary>
public class BroadcastUserRegistrationHandler : IEventHandler<UserCreated>
{
    private readonly IHubContext<ChatHub> _hubContext;
    private readonly ILogger<BroadcastUserRegistrationHandler> _logger;

    public BroadcastUserRegistrationHandler(
        IHubContext<ChatHub> hubContext,
        ILogger<BroadcastUserRegistrationHandler> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task Handle(UserCreated notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("🚀 Broadcasting user registration: {UserId} - {Email}", 
            notification.UserId, notification.Email);

        // Direct SignalR broadcast - clean and simple!
        await BroadcastViaSignalR(notification);
    }

    private async Task BroadcastViaSignalR(UserCreated notification)
    {
        try
        {
            var userRegisteredEvent = new
            {
                Type = "UserRegistered",
                UserId = notification.UserId,
                Email = notification.Email,
                Timestamp = notification.OccurredAt,
                Message = $"🎉 New user joined: {notification.Email}"
            };

            // Broadcast to all connected clients
            await _hubContext.Clients.All.SendAsync("UserEvent", userRegisteredEvent);
            
            _logger.LogInformation("📡 SignalR: User registration broadcasted to all clients");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to broadcast user registration via SignalR");
        }
    }


} 