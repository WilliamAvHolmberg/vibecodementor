using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Diagnostics.ResourceMonitoring;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Runtime.InteropServices;
using Source.Infrastructure;

namespace api.Source.Infrastructure.Services.BackgroundJobs;

/// <summary>
/// Background service that collects and broadcasts real-time system metrics using cross-platform methods
/// </summary>
public class SystemMetricsService : BackgroundService
{
    private readonly ILogger<SystemMetricsService> _logger;
    private readonly IHubContext<MetricsHub> _hubContext;
    private readonly IResourceMonitor? _resourceMonitor;
    private readonly IServiceProvider _serviceProvider;
    
    // For macOS fallback CPU calculation
    private TimeSpan _lastCpuTime;
    private DateTime _lastMeasurement;

    public SystemMetricsService(
        ILogger<SystemMetricsService> logger,
        IHubContext<MetricsHub> hubContext,
        IServiceProvider serviceProvider,
        IResourceMonitor? resourceMonitor = null)
    {
        _logger = logger;
        _hubContext = hubContext;
        _resourceMonitor = resourceMonitor;
        _serviceProvider = serviceProvider;
        
        // Initialize fallback CPU measurement for macOS
        if (_resourceMonitor == null)
        {
            var process = Process.GetCurrentProcess();
            _lastCpuTime = process.TotalProcessorTime;
            _lastMeasurement = DateTime.UtcNow;
            _logger.LogInformation("SystemMetricsService: IResourceMonitor not available (macOS), using fallback metrics");
        }
        else
        {
            _logger.LogInformation("SystemMetricsService: Using Microsoft.Extensions.Diagnostics.ResourceMonitoring");
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SystemMetricsService starting...");
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var metrics = await CollectMetricsAsync(stoppingToken);
                await _hubContext.Clients.All.SendAsync("SystemMetrics", metrics, stoppingToken);
                
                await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when cancellation is requested
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error collecting or broadcasting system metrics");
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
        
        _logger.LogInformation("SystemMetricsService stopped.");
    }

    private async Task<object> CollectMetricsAsync(CancellationToken cancellationToken)
    {
        // Get additional metrics using Process
        var process = Process.GetCurrentProcess();
        var totalMemoryMB = GC.GetTotalMemory(false) / 1024 / 1024;
        
        // Get custom application metrics
        var customMetrics = await GetCustomMetricsAsync(cancellationToken);

        if (_resourceMonitor != null)
        {
            // Use Microsoft Resource Monitoring (Windows/Linux)
            var resourceUtilization = _resourceMonitor.GetUtilization(TimeSpan.FromSeconds(1));
            
            return new
            {
                // From Microsoft.Extensions.Diagnostics.ResourceMonitoring
                CpuUsagePercent = Math.Round(resourceUtilization.CpuUsedPercentage * 100, 1),
                MemoryUsagePercent = Math.Round(resourceUtilization.MemoryUsedPercentage * 100, 1),
                MemoryUsedMB = Math.Round(resourceUtilization.MemoryUsedInBytes / 1024.0 / 1024.0, 1),
                GuaranteedMemoryMB = Math.Round(resourceUtilization.SystemResources.GuaranteedMemoryInBytes / 1024.0 / 1024.0, 1),
                MaximumMemoryMB = Math.Round(resourceUtilization.SystemResources.MaximumMemoryInBytes / 1024.0 / 1024.0, 1),
                GuaranteedCpuUnits = resourceUtilization.SystemResources.GuaranteedCpuUnits,
                MaximumCpuUnits = resourceUtilization.SystemResources.MaximumCpuUnits,
                
                // Additional metrics
                GcMemoryMB = totalMemoryMB,
                ThreadCount = process.Threads.Count,
                ProcessId = process.Id,
                ProcessName = process.ProcessName,
                Uptime = Math.Round((DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime()).TotalMinutes, 1),
                
                // Custom application metrics
                TotalVisits = customMetrics.TotalVisits,
                TodayVisits = customMetrics.TodayVisits,
                ActiveConnections = customMetrics.ActiveConnections,
                RequestsPerMinute = customMetrics.RequestsPerMinute,
                
                Timestamp = DateTime.UtcNow,
                MetricsSource = "Microsoft.Extensions.Diagnostics.ResourceMonitoring"
            };
        }
        else
        {
            // Fallback metrics for macOS
            var cpuUsage = GetFallbackCpuUsage(process);
            var memoryUsageMB = Math.Round(process.WorkingSet64 / (1024.0 * 1024.0), 1);
            
            return new
            {
                // Fallback metrics
                CpuUsagePercent = cpuUsage,
                MemoryUsagePercent = 0.0, // We don't have total system memory easily available
                MemoryUsedMB = memoryUsageMB,
                WorkingSetMB = memoryUsageMB,
                PrivateMemoryMB = Math.Round(process.PrivateMemorySize64 / (1024.0 * 1024.0), 1),
                VirtualMemoryMB = Math.Round(process.VirtualMemorySize64 / (1024.0 * 1024.0), 1),
                
                // Additional metrics
                GcMemoryMB = totalMemoryMB,
                ThreadCount = process.Threads.Count,
                ProcessId = process.Id,
                ProcessName = process.ProcessName,
                Uptime = Math.Round((DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime()).TotalMinutes, 1),
                
                // Custom application metrics
                TotalVisits = customMetrics.TotalVisits,
                TodayVisits = customMetrics.TodayVisits,
                ActiveConnections = customMetrics.ActiveConnections,
                RequestsPerMinute = customMetrics.RequestsPerMinute,
                
                Timestamp = DateTime.UtcNow,
                MetricsSource = "Fallback (macOS)"
            };
        }
    }

    private double GetFallbackCpuUsage(Process process)
    {
        try
        {
            var currentTime = DateTime.UtcNow;
            var currentCpuTime = process.TotalProcessorTime;
            
            var timeDiff = currentTime - _lastMeasurement;
            var cpuDiff = currentCpuTime - _lastCpuTime;
            
            if (timeDiff.TotalMilliseconds > 0)
            {
                var cpuUsage = (cpuDiff.TotalMilliseconds / timeDiff.TotalMilliseconds) / Environment.ProcessorCount * 100;
                
                // Update for next calculation
                _lastCpuTime = currentCpuTime;
                _lastMeasurement = currentTime;
                
                return Math.Max(0, Math.Min(100, Math.Round(cpuUsage, 1)));
            }
            
            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to calculate fallback CPU usage");
            return 0;
        }
    }

    private async Task<(int TotalVisits, int TodayVisits, int ActiveConnections, int RequestsPerMinute)> GetCustomMetricsAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            // Get total visits from database
            var totalVisits = await context.Visits.CountAsync(cancellationToken);
            
            // Get today's visits
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var dailyStats = await context.DailyVisitStats.FindAsync(new object[] { today }, cancellationToken);
            var todayVisits = dailyStats?.VisitCount ?? 0;
            
            return (totalVisits, todayVisits, 0, 0); // TODO: Implement active connections and requests per minute
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get custom metrics");
        }
        
        return (0, 0, 0, 0);
    }
}

/// <summary>
/// Cross-platform system metrics data model
/// </summary>
public class SystemMetrics
{
    public DateTime Timestamp { get; set; }
    public double CpuUsagePercent { get; set; }
    public double MemoryUsageMB { get; set; }
    public double DiskUsagePercent { get; set; }
    public int ActiveConnections { get; set; }
    public int RequestsPerMinute { get; set; }
    public int UptimeSeconds { get; set; }
    public int ThreadCount { get; set; }
    public int ProcessId { get; set; }
    
    // Additional cross-platform metrics
    public double WorkingSetMB { get; set; }
    public double PrivateMemoryMB { get; set; }
    public double VirtualMemoryMB { get; set; }
}

/// <summary>
/// SignalR hub for broadcasting system metrics
/// </summary>
public class MetricsHub : Hub
{
    private readonly ILogger<MetricsHub> _logger;

    public MetricsHub(ILogger<MetricsHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("📊 Client connected to MetricsHub: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("📊 Client disconnected from MetricsHub: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
} 