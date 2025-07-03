using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Api.Features.OpenRouter
{
    // Request for chat completions
    public class ChatCompletionRequest
    {
        // Messages to send to the model
        [JsonPropertyName("messages")]
        public List<Message> Messages { get; set; } = new List<Message>();

        // Optional text prompt
        [JsonPropertyName("prompt")]
        public string? Prompt { get; set; }

        // Model to use
        [JsonPropertyName("model")]
        public string? Model { get; set; }

        // Response format configuration
        [JsonPropertyName("response_format")]
        public ResponseFormat? ResponseFormat { get; set; }

        // Stop sequences
        [JsonPropertyName("stop")]
        public object? Stop { get; set; }

        // Whether to stream the response
        [JsonPropertyName("stream")]
        public bool? Stream { get; set; }

        // Maximum tokens to generate
        [JsonPropertyName("max_tokens")]
        public int? MaxTokens { get; set; }

        // Temperature (0-2)
        [JsonPropertyName("temperature")]
        public float? Temperature { get; set; }

        // Tools the model may use
        [JsonPropertyName("tools")]
        public List<Tool>? Tools { get; set; }

        // Tool usage control
        [JsonPropertyName("tool_choice")]
        public object? ToolChoice { get; set; }

        // Random seed
        [JsonPropertyName("seed")]
        public int? Seed { get; set; }

        // Top-p sampling (0-1]
        [JsonPropertyName("top_p")]
        public float? TopP { get; set; }

        // Top-k sampling
        [JsonPropertyName("top_k")]
        public int? TopK { get; set; }

        // Frequency penalty [-2,2]
        [JsonPropertyName("frequency_penalty")]
        public float? FrequencyPenalty { get; set; }

        // Presence penalty [-2,2]
        [JsonPropertyName("presence_penalty")]
        public float? PresencePenalty { get; set; }

        // Repetition penalty (0,2]
        [JsonPropertyName("repetition_penalty")]
        public float? RepetitionPenalty { get; set; }

        // Modify token likelihoods
        [JsonPropertyName("logit_bias")]
        public Dictionary<int, float>? LogitBias { get; set; }

        // Top logprobs
        [JsonPropertyName("top_logprobs")]
        public int? TopLogprobs { get; set; }

        // Min-p sampling
        [JsonPropertyName("min_p")]
        public float? MinP { get; set; }

        // Top-a sampling
        [JsonPropertyName("top_a")]
        public float? TopA { get; set; }

        // Predicted output
        [JsonPropertyName("prediction")]
        public Prediction? Prediction { get; set; }

        // OpenRouter transforms
        [JsonPropertyName("transforms")]
        public List<string>? Transforms { get; set; }

        // Models to try
        [JsonPropertyName("models")]
        public List<string>? Models { get; set; }

        // Routing strategy
        [JsonPropertyName("route")]
        public string? Route { get; set; }

        // Provider preferences
        [JsonPropertyName("provider")]
        public object? Provider { get; set; }
    }

    // Response format configuration
    public class ResponseFormat
    {
        // Format type
        [JsonPropertyName("type")]
        public string Type { get; set; } = "json_object";
    }

    // Prediction for reducing latency
    public class Prediction
    {
        // Prediction type
        [JsonPropertyName("type")]
        public string Type { get; set; } = "content";

        // Predicted content
        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }

    // Message in a conversation
    public class Message
    {
        // Role (user, assistant, system, tool)
        [JsonPropertyName("role")]
        public string? Role { get; set; }

        // Message content
        [JsonPropertyName("content")]
        public object? Content { get; set; }

        // Optional sender name
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        // Tool call ID (for tool responses)
        [JsonPropertyName("tool_call_id")]
        public string? ToolCallId { get; set; }

        // Tool calls made by assistant
        [JsonPropertyName("tool_calls")]
        public ToolCall[]? ToolCalls { get; set; }

        // Create a user message
        public static Message FromUser(string content, string? name = null)
        {
            return new Message { Role = "user", Content = content, Name = name };
        }

        // Create a user message with rich content
        public static Message FromUser(List<ContentPart> content, string? name = null)
        {
            return new Message { Role = "user", Content = content, Name = name };
        }

        // Create a system message
        public static Message FromSystem(string content)
        {
            return new Message { Role = "system", Content = content };
        }

        // Create an assistant message
        public static Message FromAssistant(string content, string? name = null)
        {
            return new Message { Role = "assistant", Content = content, Name = name };
        }

        // Create a tool response message
        public static Message FromTool(string content, string toolCallId)
        {
            return new Message { Role = "tool", Content = content, ToolCallId = toolCallId };
        }
    }

    // Tool call information
    public class ToolCall
    {
        // Unique ID
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        // Type of tool call
        [JsonPropertyName("type")]
        public string Type { get; set; } = "function";

        // Function call information
        [JsonPropertyName("function")]
        public FunctionCall? Function { get; set; }
    }

    // Function call information
    public class FunctionCall
    {
        // Function name
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        // Function arguments as JSON
        [JsonPropertyName("arguments")]
        public string? Arguments { get; set; }
    }

    // Base class for content parts
    public abstract class ContentPart
    {
        // Content type
        [JsonPropertyName("type")]
        public abstract string Type { get; }
    }

    // Text content
    public class TextContent : ContentPart
    {
        // Content type
        [JsonPropertyName("type")]
        public override string Type => "text";

        // Text content
        [JsonPropertyName("text")]
        public string? Text { get; set; }

        public TextContent(string text)
        {
            Text = text;
        }
    }

    // Image content
    public class ImageContent : ContentPart
    {
        // Content type
        [JsonPropertyName("type")]
        public override string Type => "image_url";

        // Image URL information
        [JsonPropertyName("image_url")]
        public ImageUrl? ImageUrl { get; set; }

        public ImageContent(string url, string detail = "auto")
        {
            ImageUrl = new ImageUrl { Url = url, Detail = detail };
        }
    }

    // Image URL information
    public class ImageUrl
    {
        // Image URL or base64 data
        [JsonPropertyName("url")]
        public string? Url { get; set; }

        // Detail level
        [JsonPropertyName("detail")]
        public string Detail { get; set; } = "auto";
    }

    // Tool definition
    public class Tool
    {
        // Tool type
        [JsonPropertyName("type")]
        public string Type { get; set; } = "function";

        // Function description
        [JsonPropertyName("function")]
        public FunctionDescription? Function { get; set; }

        // Create a function tool
        public static Tool CreateFunctionTool(string name, string description, object parameters)
        {
            return new Tool
            {
                Type = "function",
                Function = new FunctionDescription
                {
                    Name = name,
                    Description = description,
                    Parameters = parameters
                }
            };
        }
    }

    // Function description
    public class FunctionDescription
    {
        // Function name
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        // Function description
        [JsonPropertyName("description")]
        public string? Description { get; set; }

        // Parameters schema
        [JsonPropertyName("parameters")]
        public object? Parameters { get; set; }
    }

    // Chat completion response
    public class ChatCompletionResponse
    {
        // Response ID
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        // Choices returned by model
        [JsonPropertyName("choices")]
        public List<Choice>? Choices { get; set; }

        // Creation timestamp
        [JsonPropertyName("created")]
        public long Created { get; set; }

        // Model used
        [JsonPropertyName("model")]
        public string? Model { get; set; }

        // Object type
        [JsonPropertyName("object")]
        public string? Object { get; set; }

        // System fingerprint
        [JsonPropertyName("system_fingerprint")]
        public string? SystemFingerprint { get; set; }

        // Token usage
        [JsonPropertyName("usage")]
        public ResponseUsage? Usage { get; set; }
    }

    // Streaming response
    public class ChatCompletionStreamResponse
    {
        // Response ID
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        // Streaming choices
        [JsonPropertyName("choices")]
        public List<StreamingChoice>? Choices { get; set; }

        // Creation timestamp
        [JsonPropertyName("created")]
        public long Created { get; set; }

        // Model used
        [JsonPropertyName("model")]
        public string? Model { get; set; }

        // Object type
        [JsonPropertyName("object")]
        public string? Object { get; set; }

        // System fingerprint
        [JsonPropertyName("system_fingerprint")]
        public string? SystemFingerprint { get; set; }

        // Token usage
        [JsonPropertyName("usage")]
        public ResponseUsage? Usage { get; set; }
    }

    // Error response structure
    public class ErrorResponse
    {
        // Error details
        [JsonPropertyName("error")]
        public ErrorInfo? Error { get; set; }
    }

    // Error information
    public class ErrorInfo
    {
        // Error code
        [JsonPropertyName("code")]
        public int Code { get; set; }

        // Error message
        [JsonPropertyName("message")]
        public string? Message { get; set; }

        // Additional metadata
        [JsonPropertyName("metadata")]
        public Dictionary<string, object>? Metadata { get; set; }
    }

    // Completion choice
    public class Choice
    {
        // Choice index
        [JsonPropertyName("index")]
        public int Index { get; set; }

        // Message content
        [JsonPropertyName("message")]
        public Message? Message { get; set; }

        // Reason generation stopped
        [JsonPropertyName("finish_reason")]
        public string? FinishReason { get; set; }
    }

    // Streaming choice
    public class StreamingChoice
    {
        // Choice index
        [JsonPropertyName("index")]
        public int Index { get; set; }

        // Message delta content
        [JsonPropertyName("delta")]
        public MessageDelta? Delta { get; set; }

        // Reason generation stopped
        [JsonPropertyName("finish_reason")]
        public string? FinishReason { get; set; }
    }

    // Delta of message content
    public class MessageDelta
    {
        // Role delta
        [JsonPropertyName("role")]
        public string? Role { get; set; }

        // Content delta
        [JsonPropertyName("content")]
        public string? Content { get; set; }

        // Tool calls delta
        [JsonPropertyName("tool_calls")]
        public ToolCall[]? ToolCalls { get; set; }
    }

    // Token usage information
    public class ResponseUsage
    {
        // Prompt tokens
        [JsonPropertyName("prompt_tokens")]
        public int PromptTokens { get; set; }

        // Completion tokens
        [JsonPropertyName("completion_tokens")]
        public int CompletionTokens { get; set; }

        // Total tokens
        [JsonPropertyName("total_tokens")]
        public int TotalTokens { get; set; }
    }



    /*
    CUSTOM MODELS
    */

    public enum StreamEventType
    {
        StateChange,
        TextContent,
        ToolCall,
        ToolResult,
        Error
    }

    public enum StreamState
    {
        Loading,
        Text,

        /// <summary>
        /// Currently processing a tool call
        /// </summary>
        ToolCall,

        /// <summary>
        /// Stream has completed
        /// </summary>
        Complete
    }

    /// <summary>
    /// Event arguments for stream events
    /// </summary>
    public class StreamEventArgs : EventArgs
    {
        /// <summary>
        /// Type of stream event
        /// </summary>
        public StreamEventType EventType { get; set; }

        /// <summary>
        /// Current stream state
        /// </summary>
        public StreamState State { get; set; }

        /// <summary>
        /// Name of tool being called (if applicable)
        /// </summary>
        public string? ToolName { get; set; }

        /// <summary>
        /// Text delta received in this chunk
        /// </summary>
        public string? TextDelta { get; set; }

        /// <summary>
        /// Tool call information (if applicable)
        /// </summary>
        public ToolCall? ToolCall { get; set; }

        /// <summary>
        /// Tool result information (if applicable)
        /// </summary>
        public string? ToolResult { get; set; }

        /// <summary>
        /// Original response object
        /// </summary>
        public object? OriginalResponse { get; set; }

    }
}