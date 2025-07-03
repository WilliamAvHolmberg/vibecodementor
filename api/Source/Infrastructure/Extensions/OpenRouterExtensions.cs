using Api.Features.OpenRouter;
using Api.Features.OpenRouter.Services;

namespace Source.Infrastructure.Extensions;

public static class OpenRouterExtensions
{
    /// <summary>
    /// Add OpenRouter AI services for chat and analytics tools
    /// </summary>
    public static IServiceCollection AddOpenRouterServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Register conversation cache service as singleton to maintain state across requests
        services.AddSingleton<ConversationCacheService>();
        
        // Register HttpClient for OpenRouter API calls
        services.AddHttpClient<OpenRouterClient>(client =>
        {
            client.BaseAddress = new Uri("https://openrouter.ai/api/v1/");
            client.DefaultRequestHeaders.Add("User-Agent", "rapid-dev/1.0");
            // Important: Set a timeout that's longer than typical streaming duration
            client.Timeout = TimeSpan.FromMinutes(5);
        });

        return services;
    }
} 