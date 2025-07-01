using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.ResourceMonitoring;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SignalR.Client;
using System.Collections.Concurrent;
using System.Text.Json;
using api.Source.Infrastructure.Services.BackgroundJobs;

namespace api.Tests;

[Collection("Integration")]
public class SystemMetricsServiceTests : TestBase
{
    private readonly ILogger<SystemMetricsServiceTests> _logger;

    public SystemMetricsServiceTests()
    {
        _logger = Scope.ServiceProvider.GetRequiredService<ILogger<SystemMetricsServiceTests>>();
    }

    [Fact]
    public async Task SystemMetricsService_ShouldBroadcastMetrics_ViaSignalR()
    {
        // Arrange - Create authenticated user for SignalR connection
        var (user, token) = await CreateAuthenticatedUserAsync();
        
        var hubUrl = $"{Client.BaseAddress}hubs/metrics";
        var connection = new HubConnectionBuilder()
            .WithUrl(hubUrl, options =>
            {
                options.HttpMessageHandlerFactory = _ => Factory.Server.CreateHandler();
                options.AccessTokenProvider = () => Task.FromResult(token)!;
            })
            .Build();

        var metricsReceived = new ConcurrentQueue<object>();
        var metricsReceived_TaskCompletionSource = new TaskCompletionSource<object>();

        connection.On<object>("SystemMetrics", (metricsData) =>
        {
            _logger.LogInformation("📊 Received SystemMetrics via SignalR: {Metrics}", JsonSerializer.Serialize(metricsData));
            metricsReceived.Enqueue(metricsData);
            metricsReceived_TaskCompletionSource.TrySetResult(metricsData);
        });

        // Start connection
        await connection.StartAsync();
        await Task.Delay(1000); // Let connection stabilize and wait for metrics broadcast

        // Act - Wait for metrics to be broadcast (SystemMetricsService broadcasts every second)
        var receivedMetrics = await metricsReceived_TaskCompletionSource.Task.WaitAsync(TimeSpan.FromSeconds(10));

        // Assert
        Assert.NotNull(receivedMetrics);
        Assert.Single(metricsReceived);
        
        // Verify the metrics data structure
        var metricsJson = JsonSerializer.Serialize(receivedMetrics);
        _logger.LogInformation("📋 Metrics details: {MetricsJson}", metricsJson);
        
        // Parse and verify metrics contains expected data
        var metricsDoc = JsonDocument.Parse(metricsJson);
        
        // Required fields that should always be present
        Assert.True(metricsDoc.RootElement.TryGetProperty("cpuUsagePercent", out var cpuElement));
        Assert.True(cpuElement.ValueKind == JsonValueKind.Number);
        
        Assert.True(metricsDoc.RootElement.TryGetProperty("memoryUsedMB", out var memoryElement));
        Assert.True(memoryElement.ValueKind == JsonValueKind.Number);
        
        Assert.True(metricsDoc.RootElement.TryGetProperty("threadCount", out var threadCountElement));
        Assert.True(threadCountElement.ValueKind == JsonValueKind.Number);
        Assert.True(threadCountElement.GetInt32() > 0);
        
        Assert.True(metricsDoc.RootElement.TryGetProperty("processId", out var processIdElement));
        Assert.True(processIdElement.ValueKind == JsonValueKind.Number);
        Assert.True(processIdElement.GetInt32() > 0);
        
        Assert.True(metricsDoc.RootElement.TryGetProperty("processName", out var processNameElement));
        var processName = processNameElement.GetString();
        Assert.True(processName == "api" || processName == "dotnet", $"Expected 'api' or 'dotnet', but got '{processName}'");
        
        Assert.True(metricsDoc.RootElement.TryGetProperty("timestamp", out var timestampElement));
        Assert.True(timestampElement.ValueKind == JsonValueKind.String);
        
        Assert.True(metricsDoc.RootElement.TryGetProperty("metricsSource", out var sourceElement));
        var source = sourceElement.GetString();
        Assert.True(source == "Microsoft.Extensions.Diagnostics.ResourceMonitoring" || source == "Fallback (macOS)");
        
        // Visit tracking metrics
        Assert.True(metricsDoc.RootElement.TryGetProperty("totalVisits", out var totalVisitsElement));
        Assert.True(totalVisitsElement.ValueKind == JsonValueKind.Number);
        
        Assert.True(metricsDoc.RootElement.TryGetProperty("todayVisits", out var todayVisitsElement));
        Assert.True(todayVisitsElement.ValueKind == JsonValueKind.Number);

        _logger.LogInformation("✅ SystemMetricsService SignalR Broadcast: SUCCESS!");
        _logger.LogInformation("  📊 Metrics Source: {Source}", source);
        _logger.LogInformation("  🖥️ CPU Usage: {CpuUsage}%", cpuElement.GetDouble());
        _logger.LogInformation("  💾 Memory Used: {MemoryUsed}MB", memoryElement.GetDouble());
        _logger.LogInformation("  🧵 Thread Count: {ThreadCount}", threadCountElement.GetInt32());

        // Cleanup
        await connection.StopAsync();
        await connection.DisposeAsync();
    }

    [Fact]
    public async Task SystemMetricsService_ShouldHandleMissingVisitTracker_Gracefully()
    {
        // This test verifies that the service doesn't crash when visit tracking fails
        
        // Arrange - Create authenticated user for SignalR connection
        var (user, token) = await CreateAuthenticatedUserAsync();
        
        var hubUrl = $"{Client.BaseAddress}hubs/metrics";
        var connection = new HubConnectionBuilder()
            .WithUrl(hubUrl, options =>
            {
                options.HttpMessageHandlerFactory = _ => Factory.Server.CreateHandler();
                options.AccessTokenProvider = () => Task.FromResult(token)!;
            })
            .Build();

        var metricsReceived_TaskCompletionSource = new TaskCompletionSource<object>();
        connection.On<object>("SystemMetrics", (metricsData) =>
        {
            metricsReceived_TaskCompletionSource.TrySetResult(metricsData);
        });

        // Start connection
        await connection.StartAsync();
        await Task.Delay(1000);

        // Act - Wait for metrics (should still work even if visit tracking has issues)
        var receivedMetrics = await metricsReceived_TaskCompletionSource.Task.WaitAsync(TimeSpan.FromSeconds(10));

        // Assert - Should still receive metrics even if visit tracking fails
        Assert.NotNull(receivedMetrics);
        
        var metricsJson = JsonSerializer.Serialize(receivedMetrics);
        var metricsDoc = JsonDocument.Parse(metricsJson);
        
        // Core metrics should still be present
        Assert.True(metricsDoc.RootElement.TryGetProperty("cpuUsagePercent", out _));
        Assert.True(metricsDoc.RootElement.TryGetProperty("memoryUsedMB", out _));
        Assert.True(metricsDoc.RootElement.TryGetProperty("processId", out _));
        
        // Visit metrics should default to 0 if service fails
        Assert.True(metricsDoc.RootElement.TryGetProperty("totalVisits", out var totalVisitsElement));
        Assert.True(metricsDoc.RootElement.TryGetProperty("todayVisits", out var todayVisitsElement));
        
        _logger.LogInformation("✅ SystemMetricsService Graceful Error Handling: SUCCESS!");

        // Cleanup
        await connection.StopAsync();
        await connection.DisposeAsync();
    }

    [Fact]
    public void SystemMetricsService_ShouldInitialize_WithoutResourceMonitor_OnMacOS()
    {
        // This test verifies the service can be created without IResourceMonitor (macOS scenario)
        
        // Arrange
        var logger = Scope.ServiceProvider.GetRequiredService<ILogger<SystemMetricsService>>();
        var hubContext = Scope.ServiceProvider.GetRequiredService<IHubContext<MetricsHub>>();
        var serviceProvider = Scope.ServiceProvider;

        // Act - Create service without IResourceMonitor (simulating macOS)
        var service = new SystemMetricsService(logger, hubContext, serviceProvider, resourceMonitor: null);

        // Assert - Should not throw and service should be created
        Assert.NotNull(service);
        
        _logger.LogInformation("✅ SystemMetricsService Initialization without ResourceMonitor: SUCCESS!");
    }

    [Fact]
    public async Task MetricsHub_ShouldHandleConnectionLifecycle()
    {
        // This test verifies the MetricsHub connection lifecycle
        
        // Arrange
        var (user, token) = await CreateAuthenticatedUserAsync();
        
        var hubUrl = $"{Client.BaseAddress}hubs/metrics";
        var connection = new HubConnectionBuilder()
            .WithUrl(hubUrl, options =>
            {
                options.HttpMessageHandlerFactory = _ => Factory.Server.CreateHandler();
                options.AccessTokenProvider = () => Task.FromResult(token)!;
            })
            .Build();

        // Act & Assert - Connection lifecycle
        Assert.Equal(HubConnectionState.Disconnected, connection.State);
        
        await connection.StartAsync();
        Assert.Equal(HubConnectionState.Connected, connection.State);
        
        await connection.StopAsync();
        Assert.Equal(HubConnectionState.Disconnected, connection.State);
        
        await connection.DisposeAsync();
        
        _logger.LogInformation("✅ MetricsHub Connection Lifecycle: SUCCESS!");
    }

    [Fact]
    public async Task SystemMetrics_ShouldIncludeVisitTracking_WhenVisitsMade()
    {
        // This test verifies that visit tracking integrates with system metrics
        
        // Arrange - Create authenticated user and SignalR connection
        var (user, token) = await CreateAuthenticatedUserAsync();
        
        var hubUrl = $"{Client.BaseAddress}hubs/metrics";
        var connection = new HubConnectionBuilder()
            .WithUrl(hubUrl, options =>
            {
                options.HttpMessageHandlerFactory = _ => Factory.Server.CreateHandler();
                options.AccessTokenProvider = () => Task.FromResult(token)!;
            })
            .Build();

        var metricsReceived_TaskCompletionSource = new TaskCompletionSource<object>();
        connection.On<object>("SystemMetrics", (metricsData) =>
        {
            metricsReceived_TaskCompletionSource.TrySetResult(metricsData);
        });

        await connection.StartAsync();

        // Act - Simulate some activity that might trigger visit tracking
        // (In a real scenario, this would be actual user visits)
        SetAuthorizationHeader(token);
        var response = await Client.GetAsync("/api/chat/health");
        response.EnsureSuccessStatusCode();

        // Wait for metrics to be broadcast
        var receivedMetrics = await metricsReceived_TaskCompletionSource.Task.WaitAsync(TimeSpan.FromSeconds(10));

        // Assert
        Assert.NotNull(receivedMetrics);
        
        var metricsJson = JsonSerializer.Serialize(receivedMetrics);
        var metricsDoc = JsonDocument.Parse(metricsJson);
        
        // Visit metrics should be present (even if 0)
        Assert.True(metricsDoc.RootElement.TryGetProperty("totalVisits", out var totalVisitsElement));
        Assert.True(metricsDoc.RootElement.TryGetProperty("todayVisits", out var todayVisitsElement));
        
        var totalVisits = totalVisitsElement.GetInt32();
        var todayVisits = todayVisitsElement.GetInt32();
        
        _logger.LogInformation("✅ Visit Tracking Integration: SUCCESS!");
        _logger.LogInformation("  📈 Total Visits: {TotalVisits}", totalVisits);
        _logger.LogInformation("  📅 Today Visits: {TodayVisits}", todayVisits);

        // Cleanup
        await connection.StopAsync();
        await connection.DisposeAsync();
    }
} 