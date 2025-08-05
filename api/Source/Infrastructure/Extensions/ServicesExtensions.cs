using Source.Infrastructure.Services.Email;
using Source.Infrastructure.Services.FileStorage;
using Source.Infrastructure.Services.RealTime;
using Source.Features.ATA.Services;
using Resend;

namespace Source.Infrastructure.Extensions;

public static class ServicesExtensions
{
    public static IServiceCollection AddOfflineFirstServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Email Service - Configurable provider
        var emailProvider = configuration["Email:Provider"] ?? "Console";
        
        switch (emailProvider.ToUpperInvariant())
        {
            case "RESEND":
                // Configure Resend client
                services.AddOptions();
                services.AddHttpClient<ResendClient>();
                services.Configure<ResendClientOptions>(o =>
                {
                    o.ApiToken = configuration["Email:Resend:ApiToken"] 
                        ?? throw new InvalidOperationException("Email:Resend:ApiToken configuration is required when using Resend provider");
                });
                services.AddTransient<IResend, ResendClient>();
                services.AddScoped<IEmailService, ResendEmailService>();
                break;
            case "CONSOLE":
            default:
                services.AddScoped<IEmailService, ConsoleEmailService>();
                break;
        }

        // File Storage Service - Configurable provider
        var fileStorageProvider = configuration["FileStorage:Provider"] ?? "Local";
        Console.WriteLine($"File Storage Provider: {fileStorageProvider}");
        Console.WriteLine($"Connection string from env: {configuration["ConnectionStrings:DefaultConnection"]}");

        switch (fileStorageProvider.ToUpperInvariant())
        {
            case "R2":
                services.AddScoped<IFileStorageService, CloudflareR2StorageService>();
                break;
            case "LOCAL":
            default:
                services.AddScoped<IFileStorageService, LocalFileStorageService>();
                break;
        }

        // ATA Services
        services.AddScoped<ATANotificationService>();
        services.AddScoped<ATATimelineService>();

        return services;
    }

    /// <summary>
    /// Add real-time services (SignalR + PostgreSQL Listen/Notify)
    /// </summary>
    public static IServiceCollection AddRealTimeServices(this IServiceCollection services)
    {
        // SignalR
        services.AddSignalR();
        
        // // PostgreSQL Listen/Notify background service
        // services.AddHostedService<PostgreSqlNotificationService>();
        
        return services;
    }
} 