using System.Diagnostics;
using OpenTelemetry.Trace;

namespace Source.Infrastructure.Extensions;

public static class TelemetryExtensions
{
    public static IServiceCollection AddTelemetryServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Setup OpenTelemetry Tracing - follows HoneyComb official docs
        services.AddOpenTelemetry().WithTracing(builder =>
        {
            builder
                .AddAspNetCoreInstrumentation(options =>
                {
                    options.RecordException = true;
                    // Skip health check and swagger endpoints
                    options.Filter = httpContext =>
                    {
                        var path = httpContext.Request.Path.Value;
                        return !path?.StartsWith("/health") == true && 
                               !path?.StartsWith("/swagger") == true;
                    };
                })
                .AddHttpClientInstrumentation()
                .AddEntityFrameworkCoreInstrumentation()
                .AddOtlpExporter();
        });

        // Register activity source for custom MediatR tracing
        var serviceName = Environment.GetEnvironmentVariable("OTEL_SERVICE_NAME") ?? "rapid-dev-api";
        services.AddSingleton<ActivitySource>(provider => new ActivitySource(serviceName));

        return services;
    }
}