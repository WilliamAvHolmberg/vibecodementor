using api.Source.Infrastructure.Services.BackgroundJobs;
using System.Runtime.InteropServices;

namespace Source.Infrastructure.Extensions;

public static class MetricsExtensions
{
    /// <summary>
    /// Add real-time metrics and visit tracking services
    /// </summary>
    public static IServiceCollection AddMetricsServices(this IServiceCollection services)
    {
        // Register Microsoft Resource Monitoring for cross-platform system metrics (Windows/Linux only)
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows) || RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
        {
            services.AddResourceMonitoring();
        }
        
        // Memory cache is still needed for other services
        services.AddMemoryCache();
        
        // Register the metrics background service
        services.AddHostedService<SystemMetricsService>();
        
        // Register the MetricsHub for SignalR
        services.AddSignalR().AddHubOptions<MetricsHub>(options =>
        {
            options.EnableDetailedErrors = true;
        });

        return services;
    }


} 