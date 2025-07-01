using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Npgsql;
using System.Collections.Concurrent;
using System.Text.Json;

namespace api.Tests;

[Collection("Integration")]
public class ChatIntegrationTests : TestBase
{
    private readonly ILogger<ChatIntegrationTests> _logger;
    private const string TestConnectionString = "Host=localhost;Database=api_test;Username=postgres;Password=postgres";

    public ChatIntegrationTests()
    {
        _logger = Scope.ServiceProvider.GetRequiredService<ILogger<ChatIntegrationTests>>();
    }

    [Fact]
    public async Task ChatHub_UserConnection_ShouldRequireAuthentication()
    {
        // Arrange
        var hubUrl = $"{Client.BaseAddress}hubs/chat";
        
        // Act & Assert - Should fail without authentication
        var connection = new HubConnectionBuilder()
            .WithUrl(hubUrl, options =>
            {
                options.HttpMessageHandlerFactory = _ => Factory.Server.CreateHandler();
            })
            .Build();

        // Should throw due to authentication requirement
        await Assert.ThrowsAsync<HttpRequestException>(async () =>
        {
            await connection.StartAsync();
        });

        await connection.DisposeAsync();
        _logger.LogInformation("✅ ChatHub correctly requires authentication");
    }

    [Fact]
    public async Task ChatHub_AuthenticatedUser_ShouldConnectSuccessfully()
    {
        // Arrange
        var (user, token) = await CreateAuthenticatedUserAsync();
        var hubUrl = $"{Client.BaseAddress}hubs/chat";
        
        var connection = new HubConnectionBuilder()
            .WithUrl(hubUrl, options =>
            {
                options.HttpMessageHandlerFactory = _ => Factory.Server.CreateHandler();
                options.AccessTokenProvider = () => Task.FromResult<string?>(token);
            })
            .Build();

        var userJoinedReceived = new TaskCompletionSource<object>();
        
        connection.On<object>("UserJoined", (data) =>
        {
            _logger.LogInformation("🔌 Received UserJoined event: {Data}", JsonSerializer.Serialize(data));
            userJoinedReceived.SetResult(data);
        });

        // Act
        await connection.StartAsync();
        
        // Wait for UserJoined event
        var joinedData = await userJoinedReceived.Task.WaitAsync(TimeSpan.FromSeconds(5));

        // Assert
        Assert.NotNull(joinedData);
        _logger.LogInformation("✅ Authenticated user connected to ChatHub successfully");

        // Cleanup
        await connection.StopAsync();
        await connection.DisposeAsync();
    }

    [Fact]
    public async Task ChatHub_SendMessage_ShouldBroadcastToOtherUsers()
    {
        // Arrange
        var (user1, token1) = await CreateAuthenticatedUserAsync();
        var (user2, token2) = await CreateAuthenticatedUserAsync();
        var hubUrl = $"{Client.BaseAddress}hubs/chat";
        
        var connection1 = CreateAuthenticatedConnection(hubUrl, token1);
        var connection2 = CreateAuthenticatedConnection(hubUrl, token2);

        var messagesReceived = new ConcurrentQueue<object>();
        var messageReceived = new TaskCompletionSource<object>();

        connection2.On<object>("ReceiveMessage", (message) =>
        {
            _logger.LogInformation("💬 Connection2 received message: {Message}", JsonSerializer.Serialize(message));
            messagesReceived.Enqueue(message);
            messageReceived.TrySetResult(message);
        });

        // Act - Start both connections
        await connection1.StartAsync();
        await connection2.StartAsync();
        
        // Wait a bit for connections to stabilize
        await Task.Delay(500);

        // Send message from user1
        var testMessage = $"Hello from integration test! {DateTime.UtcNow:HH:mm:ss}";
        await connection1.InvokeAsync("SendMessage", testMessage);

        // Wait for message to be received by user2
        var receivedMessage = await messageReceived.Task.WaitAsync(TimeSpan.FromSeconds(10));

        // Assert
        Assert.NotNull(receivedMessage);
        Assert.Single(messagesReceived);
        _logger.LogInformation("✅ Message successfully broadcast between users");

        // Cleanup
        await connection1.StopAsync();
        await connection2.StopAsync();
        await connection1.DisposeAsync();
        await connection2.DisposeAsync();
    }

    [Fact]
    public async Task ChatHub_EmptyMessage_ShouldReturnError()
    {
        // Arrange
        var (user, token) = await CreateAuthenticatedUserAsync();
        var hubUrl = $"{Client.BaseAddress}hubs/chat";
        var connection = CreateAuthenticatedConnection(hubUrl, token);

        var errorReceived = new TaskCompletionSource<string>();
        connection.On<string>("Error", (error) =>
        {
            _logger.LogInformation("❌ Received error: {Error}", error);
            errorReceived.SetResult(error);
        });

        // Act
        await connection.StartAsync();
        await connection.InvokeAsync("SendMessage", ""); // Empty message

        // Wait for error
        var error = await errorReceived.Task.WaitAsync(TimeSpan.FromSeconds(5));

        // Assert
        Assert.Equal("Message cannot be empty", error);
        _logger.LogInformation("✅ Empty message correctly rejected with error");

        // Cleanup
        await connection.StopAsync();
        await connection.DisposeAsync();
    }

    [Fact]
    public async Task ChatHub_UserDisconnection_ShouldNotifyOthers()
    {
        // Arrange
        var (user1, token1) = await CreateAuthenticatedUserAsync();
        var (user2, token2) = await CreateAuthenticatedUserAsync();
        var hubUrl = $"{Client.BaseAddress}hubs/chat";
        
        var connection1 = CreateAuthenticatedConnection(hubUrl, token1);
        var connection2 = CreateAuthenticatedConnection(hubUrl, token2);

        var userLeftReceived = new TaskCompletionSource<object>();
        connection2.On<object>("UserLeft", (data) =>
        {
            _logger.LogInformation("👋 User left event: {Data}", JsonSerializer.Serialize(data));
            userLeftReceived.SetResult(data);
        });

        // Act
        await connection1.StartAsync();
        await connection2.StartAsync();
        await Task.Delay(500); // Let connections stabilize

        // Disconnect user1
        await connection1.StopAsync();

        // Wait for UserLeft event
        var leftData = await userLeftReceived.Task.WaitAsync(TimeSpan.FromSeconds(5));

        // Assert
        Assert.NotNull(leftData);
        _logger.LogInformation("✅ User disconnection correctly notified other users");

        // Cleanup
        await connection2.StopAsync();
        await connection1.DisposeAsync();
        await connection2.DisposeAsync();
    }

    [Fact]
    public async Task PostgreSqlNotification_SendMessage_ShouldTriggerDatabaseEvent()
    {
        // This tests the PostgreSQL LISTEN/NOTIFY functionality
        // We'll manually send a NOTIFY and verify our service handles it
        
        var notificationReceived = new TaskCompletionSource<string>();
        
        using var connection = new NpgsqlConnection(TestConnectionString);
        await connection.OpenAsync();

        // Listen for notifications
        using var listenCmd = new NpgsqlCommand("LISTEN chat_messages", connection);
        await listenCmd.ExecuteNonQueryAsync();

        connection.Notification += (sender, args) =>
        {
            _logger.LogInformation("📢 PostgreSQL notification received: {Channel} → {Payload}", args.Channel, args.Payload);
            notificationReceived.SetResult(args.Payload);
        };

        // Send a test notification
        var testPayload = JsonSerializer.Serialize(new
        {
            Id = Guid.NewGuid(),
            UserId = "test-user",
            UserName = "Test User",
            Message = "Test message from PostgreSQL notification",
            Timestamp = DateTime.UtcNow,
            IsModerated = false
        });

        using var notifyCmd = new NpgsqlCommand($"NOTIFY chat_messages, '{testPayload}'", connection);
        await notifyCmd.ExecuteNonQueryAsync();

        // Wait for notification (this will block until notification arrives)
        await connection.WaitAsync(TimeSpan.FromSeconds(5));

        // The notification should have been received
        var payload = await notificationReceived.Task.WaitAsync(TimeSpan.FromSeconds(1));

        // Assert
        Assert.NotNull(payload);
        Assert.Contains("Test message from PostgreSQL notification", payload);
        _logger.LogInformation("✅ PostgreSQL LISTEN/NOTIFY working correctly");
    }

    [Fact] 
    public async Task ChatHub_TypingIndicator_ShouldNotifyOtherUsers()
    {
        // Arrange
        var (user1, token1) = await CreateAuthenticatedUserAsync();
        var (user2, token2) = await CreateAuthenticatedUserAsync();
        var hubUrl = $"{Client.BaseAddress}hubs/chat";
        
        var connection1 = CreateAuthenticatedConnection(hubUrl, token1);
        var connection2 = CreateAuthenticatedConnection(hubUrl, token2);

        var typingReceived = new TaskCompletionSource<object>();
        connection2.On<object>("UserTyping", (data) =>
        {
            _logger.LogInformation("⌨️ Typing indicator: {Data}", JsonSerializer.Serialize(data));
            typingReceived.SetResult(data);
        });

        // Act
        await connection1.StartAsync();
        await connection2.StartAsync();
        await Task.Delay(500);

        await connection1.InvokeAsync("SendTyping");

        // Wait for typing indicator
        var typingData = await typingReceived.Task.WaitAsync(TimeSpan.FromSeconds(5));

        // Assert
        Assert.NotNull(typingData);
        _logger.LogInformation("✅ Typing indicator successfully sent to other users");

        // Cleanup
        await connection1.StopAsync();
        await connection2.StopAsync();
        await connection1.DisposeAsync();
        await connection2.DisposeAsync();
    }

    private HubConnection CreateAuthenticatedConnection(string hubUrl, string token)
    {
        return new HubConnectionBuilder()
            .WithUrl(hubUrl, options =>
            {
                options.HttpMessageHandlerFactory = _ => Factory.Server.CreateHandler();
                options.AccessTokenProvider = () => Task.FromResult<string?>(token);
            })
            .Build();
    }
} 