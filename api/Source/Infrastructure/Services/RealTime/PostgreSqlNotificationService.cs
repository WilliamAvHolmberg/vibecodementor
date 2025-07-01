using Microsoft.AspNetCore.SignalR;
using Npgsql;
using System.Text.Json;
using Source.Features.Chat.Hubs;

namespace Source.Infrastructure.Services.RealTime;

/// <summary>
/// PostgreSQL LISTEN/NOTIFY service for real-time database events
/// Bridges database notifications to SignalR for live UI updates
/// </summary>
public class PostgreSqlNotificationService : BackgroundService
{
    private readonly ILogger<PostgreSqlNotificationService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _configuration;
    private NpgsqlConnection? _connection;

    public PostgreSqlNotificationService(
        ILogger<PostgreSqlNotificationService> logger,
        IServiceProvider serviceProvider,
        IConfiguration configuration)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await InitializeConnection();
            await StartListening(stoppingToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ PostgreSQL notification service failed");
        }
    }

    private async Task InitializeConnection()
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("Database connection string not found");
        }

        _connection = new NpgsqlConnection(connectionString);
        await _connection.OpenAsync();

        _logger.LogInformation("🔌 PostgreSQL notification service connected");

        // Subscribe to channels we're interested in
        await ListenToChannel("chat_messages");
        await ListenToChannel("user_events");
        await ListenToChannel("moderation_events");
        await ListenToChannel("donation_events");
    }

    private async Task ListenToChannel(string channelName)
    {
        using var cmd = new NpgsqlCommand($"LISTEN {channelName}", _connection);
        await cmd.ExecuteNonQueryAsync();
        
        _logger.LogInformation("👂 Listening to PostgreSQL channel: {ChannelName}", channelName);
    }

    private async Task StartListening(CancellationToken stoppingToken)
    {
        if (_connection == null)
            throw new InvalidOperationException("Connection not initialized");

        _connection.Notification += async (sender, args) =>
        {
            try
            {
                await HandleNotification(args.Channel, args.Payload);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error handling PostgreSQL notification from channel {Channel}", args.Channel);
            }
        };

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Wait for notifications (this blocks until a notification arrives)
                await _connection.WaitAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("🛑 PostgreSQL notification service stopping");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error waiting for PostgreSQL notifications");
                
                // Try to reconnect after a delay
                await Task.Delay(5000, stoppingToken);
                await ReconnectIfNeeded();
            }
        }
    }

    private async Task HandleNotification(string channel, string payload)
    {
        _logger.LogInformation("📢 PostgreSQL notification: {Channel} → {Payload}", channel, payload);

        using var scope = _serviceProvider.CreateScope();
        var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<ChatHub>>();

        switch (channel)
        {
            case "chat_messages":
                await HandleChatMessage(hubContext, payload);
                break;
                
            case "user_events":
                await HandleUserEvent(hubContext, payload);
                break;
                
            case "moderation_events":
                await HandleModerationEvent(hubContext, payload);
                break;
                
            case "donation_events":
                await HandleDonationEvent(hubContext, payload);
                break;
                
            default:
                _logger.LogWarning("⚠️ Unknown notification channel: {Channel}", channel);
                break;
        }
    }

    private async Task HandleChatMessage(IHubContext<ChatHub> hubContext, string payload)
    {
        try
        {
            var messageData = JsonSerializer.Deserialize<ChatMessageNotification>(payload);
            if (messageData != null)
            {
                await hubContext.Clients.Group("GeneralChat").SendAsync("DatabaseMessage", messageData);
                _logger.LogInformation("💬 Broadcasted database chat message to SignalR clients");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error handling chat message notification");
        }
    }

    private async Task HandleUserEvent(IHubContext<ChatHub> hubContext, string payload)
    {
        try
        {
            var userData = JsonSerializer.Deserialize<UserEventNotification>(payload);
            if (userData != null)
            {
                await hubContext.Clients.All.SendAsync("UserEvent", userData);
                _logger.LogInformation("👤 Broadcasted user event to SignalR clients: {EventType}", userData.EventType);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error handling user event notification");
        }
    }

    private async Task HandleModerationEvent(IHubContext<ChatHub> hubContext, string payload)
    {
        try
        {
            var moderationData = JsonSerializer.Deserialize<ModerationEventNotification>(payload);
            if (moderationData != null)
            {
                // Only send to admins or the affected user
                await hubContext.Clients.Group("Admins").SendAsync("ModerationEvent", moderationData);
                _logger.LogInformation("🛡️ Broadcasted moderation event to admins: {EventType}", moderationData.EventType);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error handling moderation event notification");
        }
    }

    private async Task HandleDonationEvent(IHubContext<ChatHub> hubContext, string payload)
    {
        try
        {
            var donationData = JsonSerializer.Deserialize<DonationEventNotification>(payload);
            if (donationData != null)
            {
                await hubContext.Clients.All.SendAsync("DonationEvent", donationData);
                _logger.LogInformation("💰 Broadcasted donation event to all clients: {Amount}", donationData.Amount);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error handling donation event notification");
        }
    }

    private async Task ReconnectIfNeeded()
    {
        try
        {
            if (_connection?.State != System.Data.ConnectionState.Open)
            {
                _logger.LogWarning("🔄 Attempting to reconnect to PostgreSQL...");
                await InitializeConnection();
                _logger.LogInformation("✅ Successfully reconnected to PostgreSQL");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to reconnect to PostgreSQL");
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("🛑 Stopping PostgreSQL notification service");
        
        if (_connection != null)
        {
            await _connection.CloseAsync();
            await _connection.DisposeAsync();
        }
        
        await base.StopAsync(cancellationToken);
    }
}

// Notification data models
public record ChatMessageNotification(
    Guid Id,
    string UserId,
    string UserName,
    string Message,
    DateTime Timestamp,
    bool IsModerated = false
);

public record UserEventNotification(
    string UserId,
    string UserName,
    string EventType, // "registered", "login", "logout"
    DateTime Timestamp
);

public record ModerationEventNotification(
    Guid Id,
    string EventType, // "message_flagged", "image_flagged", "user_warned"
    string UserId,
    string Content,
    string Reason,
    DateTime Timestamp
);

public record DonationEventNotification(
    Guid Id,
    string DonorName,
    decimal Amount,
    string Currency,
    string Message,
    DateTime Timestamp
); 