using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

namespace Source.Infrastructure.Extensions;

public static class RateLimitingExtensions
{
    public static IServiceCollection AddRateLimitingServices(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            // 🚨 STRICT: Login/Auth endpoints - 5 attempts per minute
            options.AddFixedWindowLimiter("AuthPolicy", limiterOptions =>
            {
                limiterOptions.PermitLimit = 5;
                limiterOptions.Window = TimeSpan.FromMinutes(1);
                limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                limiterOptions.QueueLimit = 2;
            });

            // 📧 EMAIL: Registration/email endpoints - 3 per minute  
            options.AddFixedWindowLimiter("EmailPolicy", limiterOptions =>
            {
                limiterOptions.PermitLimit = 3;
                limiterOptions.Window = TimeSpan.FromMinutes(1);
                limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                limiterOptions.QueueLimit = 1;
            });

            // 📤 UPLOAD: File upload endpoints - 10 per minute
            options.AddFixedWindowLimiter("UploadPolicy", limiterOptions =>
            {
                limiterOptions.PermitLimit = 10;
                limiterOptions.Window = TimeSpan.FromMinutes(1);
                limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                limiterOptions.QueueLimit = 5;
            });

            // 🔄 GENERAL: Most API endpoints - 100 per minute
            options.AddFixedWindowLimiter("GeneralPolicy", limiterOptions =>
            {
                limiterOptions.PermitLimit = 100;
                limiterOptions.Window = TimeSpan.FromMinutes(1);
                limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                limiterOptions.QueueLimit = 10;
            });

            // 🚫 Global fallback - very generous
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
                httpContext => RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: httpContext.User.Identity?.Name ?? httpContext.Request.Headers.Host.ToString(),
                    factory: partition => new FixedWindowRateLimiterOptions
                    {
                        AutoReplenishment = true,
                        PermitLimit = 1000,
                        Window = TimeSpan.FromMinutes(1)
                    }));

            // Custom rejection response
            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = 429;
                
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                {
                    await context.HttpContext.Response.WriteAsync(
                        $"{{\"error\": \"Rate limit exceeded. Try again in {retryAfter.TotalSeconds} seconds.\", \"retryAfter\": {retryAfter.TotalSeconds}}}", 
                        cancellationToken: token);
                }
                else
                {
                    await context.HttpContext.Response.WriteAsync(
                        "{\"error\": \"Rate limit exceeded. Please try again later.\"}", 
                        cancellationToken: token);
                }
            };
        });

        return services;
    }
} 