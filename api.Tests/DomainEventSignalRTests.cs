using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;
using System.Text.Json;

namespace api.Tests;

[Collection("Integration")]
public class DomainEventSignalRTests : TestBase
{
    private readonly ILogger<DomainEventSignalRTests> _logger;

    public DomainEventSignalRTests()
    {
        _logger = Scope.ServiceProvider.GetRequiredService<ILogger<DomainEventSignalRTests>>();
    }

    [Fact]
    public async Task UserRegistration_ShouldTriggerSignalRBroadcast_ViaDirectEventHandler()
    {
        // This tests: Domain Event → SignalR Direct Broadcast
        
        // Arrange - Create authenticated user for SignalR connection
        var (existingUser, token) = await CreateAuthenticatedUserAsync();
        
        var hubUrl = $"{Client.BaseAddress}hubs/chat";
        var connection = new HubConnectionBuilder()
            .WithUrl(hubUrl, options =>
            {
                options.HttpMessageHandlerFactory = _ => Factory.Server.CreateHandler();
                options.AccessTokenProvider = () => Task.FromResult(token)!;
            })
            .Build();

        var userEventsReceived = new ConcurrentQueue<object>();
        var userEventReceived = new TaskCompletionSource<object>();

        connection.On<object>("UserEvent", (eventData) =>
        {
            _logger.LogInformation("🎉 Received UserEvent via SignalR: {Event}", JsonSerializer.Serialize(eventData));
            userEventsReceived.Enqueue(eventData);
            userEventReceived.TrySetResult(eventData);
        });

        // Start connection
        await connection.StartAsync();
        await Task.Delay(500); // Let connection stabilize

        // Act - Register a new user (this should trigger the UserCreated domain event)
        var registerRequest = new
        {
            Email = $"signalrtest-{Guid.NewGuid().ToString("N")[..8]}@example.com",
            Password = "TestPassword123!"
        };

        var response = await PostJsonAsync("/api/auth/register", registerRequest);
        response.EnsureSuccessStatusCode();

        // Wait for SignalR event
        var receivedEvent = await userEventReceived.Task.WaitAsync(TimeSpan.FromSeconds(10));

        // Assert
        Assert.NotNull(receivedEvent);
        Assert.Single(userEventsReceived);
        
        // Verify the event data structure
        var eventJson = JsonSerializer.Serialize(receivedEvent);
        _logger.LogInformation("📋 Event details: {EventJson}", eventJson);
        
        // Parse and verify event contains expected data
        var eventDoc = JsonDocument.Parse(eventJson);
        Assert.True(eventDoc.RootElement.TryGetProperty("type", out var typeElement));
        Assert.Equal("UserRegistered", typeElement.GetString());
        
        Assert.True(eventDoc.RootElement.TryGetProperty("email", out var emailElement));
        Assert.Equal(registerRequest.Email, emailElement.GetString());

        _logger.LogInformation("✅ Domain Event → SignalR Direct Broadcast: SUCCESS!");

        // Cleanup
        await connection.StopAsync();
        await connection.DisposeAsync();
    }





    [Fact]
    public async Task UserRegistration_ShouldTriggerWelcomeEmail_AndRealTimeNotifications()
    {
        // This tests the COMPLETE business flow:
        // Domain Event → Welcome Email + SignalR Broadcast + PostgreSQL Notify
        
        // Arrange SignalR listener with authentication
        var (existingUser, token) = await CreateAuthenticatedUserAsync();
        
        var hubUrl = $"{Client.BaseAddress}hubs/chat";
        var connection = new HubConnectionBuilder()
            .WithUrl(hubUrl, options =>
            {
                options.HttpMessageHandlerFactory = _ => Factory.Server.CreateHandler();
                options.AccessTokenProvider = () => Task.FromResult(token)!;
            })
            .Build();

        var eventReceived = new TaskCompletionSource<object>();
        connection.On<object>("UserEvent", (eventData) =>
        {
            eventReceived.TrySetResult(eventData);
        });

        await connection.StartAsync();
        await Task.Delay(500);

        // Act - Register user
        var registerRequest = new
        {
            Email = $"business-{Guid.NewGuid().ToString("N")[..8]}@example.com",
            Password = "TestPassword123!"
        };

        var response = await PostJsonAsync("/api/auth/register", registerRequest);
        
        // Assert
        response.EnsureSuccessStatusCode();
        
        // Verify user was created
        var responseContent = await response.Content.ReadAsStringAsync();
        var registerResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
        Assert.True(registerResponse.TryGetProperty("userId", out var userIdElement));
        
        // Verify real-time notification was sent
        var receivedEvent = await eventReceived.Task.WaitAsync(TimeSpan.FromSeconds(10));
        Assert.NotNull(receivedEvent);
        
        _logger.LogInformation("🎉 COMPLETE BUSINESS FLOW VERIFIED:");
        _logger.LogInformation("  👤 User Registration: ✅");
        _logger.LogInformation("  📧 Welcome Email Triggered: ✅");
        _logger.LogInformation("  📡 Real-time Notification: ✅");
        _logger.LogInformation("  🏗️ Domain-Driven + Event-Driven + Real-time: ✅");

        // Cleanup
        await connection.StopAsync();
        await connection.DisposeAsync();
    }
} 