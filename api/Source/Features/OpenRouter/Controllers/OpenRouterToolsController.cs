using Api.Features.OpenRouter.Tools;
using Api.Features.OpenRouter.Models;
using Api.Features.OpenRouter.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;
using Source.Infrastructure;
using Microsoft.AspNetCore.Http.Features;

namespace Api.Features.OpenRouter.Controllers
{
    [ApiController]
    [Route("api/openrouter/tools")]
    [AllowAnonymous]
    public class OpenRouterToolsController : ControllerBase
    {
        private readonly ILogger<OpenRouterToolsController> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly ApplicationDbContext _context;
        private readonly ConversationCacheService _conversationCache;
        private readonly OpenRouterClient _openRouterClient;

        public OpenRouterToolsController(
            ILogger<OpenRouterToolsController> logger,
            IConfiguration configuration,
            ApplicationDbContext context,
            ConversationCacheService conversationCache,
            OpenRouterClient openRouterClient)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = new HttpClient();
            _context = context;
            _conversationCache = conversationCache;
            _openRouterClient = openRouterClient;
        }

        [HttpGet("conversations/{conversationId}")]
        public IActionResult GetConversation([FromRoute] string conversationId)
        {
            // Get conversation-specific messages and exclude system messages
            var messages = _conversationCache.GetMessages(conversationId)
                .Where(m => m.Role != "system")
                .ToList();
            
            return Ok(messages);
        }

        public static List<OpenRouterModel> CachedModels { get; set; } = new List<OpenRouterModel>();

        /// <summary>
        /// Get available models from OpenRouter with caching
        /// </summary>
        [HttpGet("models")]
        public async Task<IActionResult> GetModels()
        {
            try
            {
                // Check if models are in cache
                if (CachedModels.Count > 0)
                {
                    _logger.LogInformation("Returning cached OpenRouter models. Count: {Count}", CachedModels.Count);
                    return Ok(CachedModels);
                }

                _logger.LogInformation("Fetching models from OpenRouter API");

                // Fetch models from OpenRouter API
                using var request = new HttpRequestMessage(HttpMethod.Get, "https://openrouter.ai/api/v1/models");
                var response = await _httpClient.SendAsync(request);

                // Read the raw response content
                var content = await response.Content.ReadAsStringAsync();

                // Log the raw response for debugging
                _logger.LogInformation("Raw OpenRouter models response: {RawResponse}", content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to fetch models from OpenRouter API. Status: {Status}, Content: {Content}",
                        response.StatusCode, content);
                    return StatusCode((int)response.StatusCode, $"Error from OpenRouter API: {content}");
                }

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var modelsResponse = JsonSerializer.Deserialize<ModelsResponse>(content, options);

                if (modelsResponse?.Data == null)
                {
                    _logger.LogError("Invalid response structure from OpenRouter API");
                    return StatusCode(500, "Invalid response from OpenRouter API");
                }

                _logger.LogInformation("Successfully deserialized {Count} models from OpenRouter",
                    modelsResponse.Data.Count);

                // Filter to models that support tools
                var models = modelsResponse.Data.ToList();

                _logger.LogInformation("Found {Count} models that support tools", models.Count);

                // Log details of each model that supports tools
                foreach (var model in models)
                {
                    _logger.LogInformation("Tool-capable model: {ModelId}, Name: {ModelName}, Context: {ContextLength}, Features: {Features}",
                        model.Id, model.Name, model.ContextLength, string.Join(", ", model.Features));
                }

                // Store in cache
                CachedModels = models;

                return Ok(models);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching models from OpenRouter");
                return StatusCode(500, $"Error fetching models: {ex.Message}");
            }
        }

        [HttpGet("chat/stream")]
        public async Task ChatWithToolsStream(
            [FromQuery] string conversationId,
            [FromQuery] string message,
            CancellationToken cancellationToken,
            [FromQuery] string model = "openai/gpt-4o")
        {
            try
            {
                // CRITICAL: Disable response buffering for streaming
                var bufferingFeature = HttpContext.Features.Get<Microsoft.AspNetCore.Http.Features.IHttpResponseBodyFeature>();
                if (bufferingFeature != null)
                {
                    bufferingFeature.DisableBuffering();
                }
                
                // Set content type for SSE
                Response.ContentType = "text/event-stream";
                Response.Headers["Cache-Control"] = "no-cache";
                Response.Headers["Connection"] = "keep-alive";
                Response.Headers["X-Accel-Buffering"] = "no"; // Disable Nginx buffering if behind proxy

                // Validate model ID
                if (string.IsNullOrEmpty(model))
                {
                    await WriteErrorEvent("Model ID is required");
                    return;
                }

                // Create a new client instance for this request (matching working implementation)
                var client = new OpenRouterClient(_configuration, new HttpClient());

                // Register visit analytics tools using the same pattern as the original device tools
                var visitAnalyticsTools = new VisitAnalyticsTools(_context);
                client.RegisterTool<string, Task<VisitOverview>>(visitAnalyticsTools.GetVisitOverview);
                client.RegisterTool<int, Task<List<DailyTrend>>>(visitAnalyticsTools.GetDailyTrends);
                client.RegisterTool<int, Task<List<PopularPage>>>(visitAnalyticsTools.GetPopularPages);
                client.RegisterTool<int, Task<List<ReferrerStats>>>(visitAnalyticsTools.GetReferrerAnalysis);
                client.RegisterTool<int, Task<List<GeographicStats>>>(visitAnalyticsTools.GetGeographicInsights);
                client.RegisterTool<int, Task<List<RecentVisit>>>(visitAnalyticsTools.GetRecentActivity);
                client.RegisterTool<int, Task<RetentionAnalysis>>(visitAnalyticsTools.GetRetentionAnalysis);

                // Subscribe to streaming events
                client.OnStreamEvent += async (sender, e) =>
                {
                    try
                    {
                        // Direct pass-through of events
                        // The event name will be the StreamEventType enum value
                        await WriteStreamEvent(e.EventType.ToString(), e);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error handling stream event");
                        await WriteErrorEvent($"Error handling stream event: {ex.Message}");
                    }
                };

                // Build conversation messages
                var messages = _conversationCache.GetMessages(conversationId);

                // Add default system message for tools if no previous messages with system role
                if (!messages.Any(m => m.Role!.Equals("system", StringComparison.OrdinalIgnoreCase)))
                {
                    messages.Add(Message.FromSystem(
                        "You are a helpful analytics assistant with access to website visit analytics tools. " +
                        "Use the available tools to provide insights about website traffic, user behavior, and trends. " +
                        "You can analyze visit patterns, popular pages, referrer sources, geographic data, and retention metrics. " +
                        "Always use the tools to provide data-driven answers and insights. " +
                        "Current date: " + DateTime.Now.ToString("yyyy-MM-dd") +
                        ". Be proactive in using the analytics tools to give comprehensive insights."
                    ));
                }

                // Add current user message
                messages.Add(Message.FromUser(message));

                // Create request object
                var chatRequest = new ChatCompletionRequest
                {
                    Model = model, // Use the specified model
                    Messages = messages,
                    Temperature = 0.5f,
                    MaxTokens = 1000,
                    Stream = true
                };

                try
                {
                    // Start streaming with events
                    var (response, finalMessages) = await client.ProcessMessageAsync(chatRequest, maxToolCalls: 5, cancellationToken);
                    _conversationCache.SetMessages(conversationId, finalMessages);
                    // Send a final "done" event
                    await WriteStreamEvent("done", new { });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing message stream");
                    await WriteErrorEvent($"Error in OpenRouter API: {ex.Message}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in streaming chat with tools endpoint");
                await WriteErrorEvent(ex.Message);
            }
        }

        // Helper method to write SSE events
        private async Task WriteStreamEvent(string eventType, object data)
        {
            // Create serializer options that convert enums to strings
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                Converters = { new JsonStringEnumConverter() }
            };

            var json = JsonSerializer.Serialize(data, jsonOptions);
            await Response.WriteAsync($"event: {eventType}\n");
            await Response.WriteAsync($"data: {json}\n\n");
            await Response.Body.FlushAsync();
        }

        // Helper method to write error events
        private async Task WriteErrorEvent(string errorMessage)
        {
            await WriteStreamEvent("error", new { error = errorMessage });
        }
    }
}