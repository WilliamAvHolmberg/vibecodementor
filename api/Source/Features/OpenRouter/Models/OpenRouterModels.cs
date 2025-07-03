using System.Text.Json.Serialization;

namespace Api.Features.OpenRouter.Models
{
    public class ToolChatRequest
    {
        public string Model { get; set; } = "openai/gpt-4o";
        public string Message { get; set; }
        public float? Temperature { get; set; }
        public int? MaxTokens { get; set; }
        public string Tools { get; set; } = "all";
        public List<MessageRequest> PreviousMessages { get; set; } = new List<MessageRequest>();
    }

    public class MessageRequest
    {
        public string Role { get; set; }
        public string Content { get; set; }
        public string? Name { get; set; }
        public string? ToolCallId { get; set; }
    }

    public class ModelsResponse
    {
        [JsonPropertyName("data")]
        public List<OpenRouterModel> Data { get; set; }
    }

    public class OpenRouterModel
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("context_length")]
        public int ContextLength { get; set; }

        [JsonPropertyName("pricing")]
        public ModelPricing Pricing { get; set; }
        
        [JsonPropertyName("description")]
        public string Description { get; set; }
        
        [JsonPropertyName("features")]
        public List<string> Features { get; set; } = new List<string>();
    }

    public class ModelPricing
    {
        [JsonPropertyName("prompt")]
        public string Prompt { get; set; }

        [JsonPropertyName("completion")]
        public string Completion { get; set; }
    }
} 