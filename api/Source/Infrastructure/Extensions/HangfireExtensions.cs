using Hangfire;
using Hangfire.PostgreSql;

namespace Source.Infrastructure.Extensions;

public static class HangfireExtensions
{
    public static IServiceCollection AddHangfireServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Check if Hangfire should be enabled (default: true)
        var enableHangfire = configuration.GetValue<bool>("Features:EnableHangfire", true);
        
        if (!enableHangfire)
        {
            // Skip Hangfire setup in testing environment
            return services;
        }

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddHangfire(config =>
        {
            config.UsePostgreSqlStorage(options =>
            {
                options.UseNpgsqlConnection(connectionString);
            });
        });

        services.AddHangfireServer(options =>
        {
            options.WorkerCount = Environment.ProcessorCount * 5;
            options.Queues = new[] { "default", "critical", "background" };
        });

        return services;
    }
} 