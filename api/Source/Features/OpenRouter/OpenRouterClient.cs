using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Api.Features.OpenRouter
{
    /// <summary>
    /// Client for the OpenRouter API
    /// </summary>
    public class OpenRouterClient
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _siteUrl;
        private readonly string _siteName;
        private readonly JsonSerializerOptions _jsonOptions;
        private readonly List<Tool> _tools = new List<Tool>();
        private readonly Dictionary<string, Func<string, object>> _toolImplementations = new Dictionary<string, Func<string, object>>();
        public event EventHandler<StreamEventArgs>? OnStreamEvent;

        public OpenRouterClient(IConfiguration configuration, HttpClient httpClient)
        {
            _apiKey = configuration["OpenRouter:ApiKey"]!;
            _siteUrl = "rapid-dev";
            _siteName = "rapid-dev";
            _httpClient = httpClient;

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
                Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
            };
        }

        public OpenRouterClient RegisterTool(
            string name,
            Func<string, object> implementation,
            string description,
            object parameters)
        {
            _tools.Add(Tool.CreateFunctionTool(name, description, parameters));
            _toolImplementations[name] = implementation;
            return this;
        }

        public object ExecuteTool(string name, string arguments)
        {
            if (!_toolImplementations.TryGetValue(name, out var implementation))
            {
                throw new InvalidOperationException($"Tool '{name}' is not registered");
            }

            // Validate arguments to prevent null reference exceptions
            if (string.IsNullOrEmpty(arguments))
            {
                arguments = "{}"; // Default to empty JSON object if no arguments
            }

            // Validate that arguments are proper JSON - if not, wrap in braces
            if (!arguments.Trim().StartsWith("{") && !arguments.Trim().StartsWith("["))
            {
                arguments = "{" + arguments + "}";
            }

            // Try to clean up any malformed JSON that might be missing closing braces
            try
            {
                // Test parse to see if it's valid JSON
                using (var doc = JsonDocument.Parse(arguments)) { }
            }
            catch (JsonException)
            {
                // If invalid JSON, try basic fix by ensuring brackets are balanced
                // This is a simple approach - won't fix all issues but handles common cases
                arguments = EnsureValidJson(arguments);
            }

            return implementation(arguments);
        }

        /// <summary>
        /// Ensure a JSON string is valid by balancing brackets
        /// </summary>
        private string EnsureValidJson(string json)
        {
            // Simple approach to balance braces
            int openBraces = json.Count(c => c == '{');
            int closeBraces = json.Count(c => c == '}');

            if (openBraces > closeBraces)
            {
                json += new string('}', openBraces - closeBraces);
            }

            return json;
        }
        public List<Tool> GetTools() => _tools.ToList();

        public async Task<ChatCompletionResponse> CreateChatCompletionAsync(
            ChatCompletionRequest request,
            CancellationToken cancellationToken = default)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));

            // Add tools to request if any are registered
            if (_tools.Count > 0 && request.Tools == null)
            {
                request.Tools = _tools;
            }

            var requestContent = JsonSerializer.Serialize(request, _jsonOptions);

            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://openrouter.ai/api/v1/chat/completions")
            {
                Content = new StringContent(requestContent, Encoding.UTF8, "application/json")
            };

            AddHeaders(httpRequest);

            var response = await _httpClient.SendAsync(httpRequest, cancellationToken);

            // Read response content regardless of success status
            var responseContent = await response.Content.ReadAsStringAsync();

            try
            {
                // Check for success
                response.EnsureSuccessStatusCode();

                try
                {
                    // Try to deserialize the response
                    return JsonSerializer.Deserialize<ChatCompletionResponse>(responseContent, _jsonOptions)!;
                }
                catch (JsonException ex)
                {
                    // Log original content when deserialization fails
                    Console.WriteLine($"JSON parsing error: {ex.Message}");
                    Console.WriteLine($"Response content that caused error: '{responseContent}'");

                    // Rethrow for now, but include more context
                    throw new JsonException($"Failed to parse OpenRouter API response: {ex.Message}. Response content: '{responseContent}'", ex);
                }
            }
            catch (HttpRequestException ex)
            {
                // Log API error responses
                Console.WriteLine($"API error: {ex.Message}");
                Console.WriteLine($"Response content: '{responseContent}'");

                throw new Exception($"OpenRouter API request failed: {ex.Message}. Response content: '{responseContent}'", ex);
            }
        }

        public async Task<Message> StreamChatCompletionAsync(
            ChatCompletionRequest request,
            Action<ChatCompletionStreamResponse> onChunk,
            Action<ErrorResponse> onError,
            CancellationToken cancellationToken = default)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));
            if (onChunk == null) throw new ArgumentNullException(nameof(onChunk));

            // Add tools to request if any are registered
            if (_tools.Count > 0 && request.Tools == null)
            {
                request.Tools = _tools;
            }

            // Ensure streaming is enabled
            request.Stream = true;

            var requestContent = JsonSerializer.Serialize(request, _jsonOptions);


            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://openrouter.ai/api/v1/chat/completions")
            {
                Content = new StringContent(requestContent, Encoding.UTF8, "application/json")
            };

            AddHeaders(httpRequest);

            var response = await _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            response.EnsureSuccessStatusCode();

            using var stream = await response.Content.ReadAsStreamAsync();
            using var reader = new System.IO.StreamReader(stream);

            // Buffer for accumulating the complete response
            var contentBuffer = new StringBuilder();
            string assistantMessageId = null;
            // Dictionary to track tool calls by ID
            var toolCallsById = new Dictionary<string, ToolCall>();
            string? lastToolCallId = null;
            string finishReason = null;

            string line;
            while ((line = await reader.ReadLineAsync()) != null && !cancellationToken.IsCancellationRequested)
            {
                if (string.IsNullOrWhiteSpace(line) || !line.StartsWith("data: "))
                    continue;

                var data = line.Substring("data: ".Length);

                // "[DONE]" is sent when the stream is complete
                if (data == "[DONE]")
                    break;

                try
                {
                    if (data.Contains("\"error\":"))
                    {
                        var error = JsonSerializer.Deserialize<ErrorResponse>(data, _jsonOptions);
                        onError(error!);
                        break;
                    }
                    var chunk = JsonSerializer.Deserialize<ChatCompletionStreamResponse>(data, _jsonOptions);
                    if (chunk != null)
                    {
                        // Process each chunk
                        onChunk(chunk);

                        // Store the ID from the first chunk
                        if (assistantMessageId == null && !string.IsNullOrEmpty(chunk.Id))
                        {
                            assistantMessageId = chunk.Id;
                        }

                        // Append content delta to our buffer
                        var choice = chunk.Choices?.FirstOrDefault();
                        if (choice?.Delta != null)
                        {
                            if (!string.IsNullOrEmpty(choice.Delta.Content))
                            {
                                contentBuffer.Append(choice.Delta.Content);
                            }

                            // Process tool calls if present
                            if (choice.Delta.ToolCalls != null && choice.Delta.ToolCalls.Length > 0)
                            {
                                foreach (var toolCallDelta in choice.Delta.ToolCalls)
                                {
                                    // We need a way to identify tool calls even if ID is missing in some deltas
                                    string toolId = toolCallDelta.Id;

                                    if (string.IsNullOrEmpty(toolId))
                                    {
                                        toolId = lastToolCallId;
                                    }

                                    lastToolCallId = toolId;

                                    // Add or merge with existing tool call
                                    if (!toolCallsById.TryGetValue(toolId!, out var existingToolCall))
                                    {
                                        // First time seeing this tool call ID, initialize it
                                        existingToolCall = new ToolCall
                                        {
                                            Id = toolId,
                                            Type = toolCallDelta.Type ?? "function", // Default to function if not specified
                                            Function = new FunctionCall()
                                        };
                                        toolCallsById[toolId!] = existingToolCall;
                                    }

                                    // Merge function information
                                    if (toolCallDelta.Function != null)
                                    {
                                        if (!string.IsNullOrEmpty(toolCallDelta.Function.Name))
                                        {
                                            existingToolCall.Function!.Name = toolCallDelta.Function.Name;
                                        }

                                        // Append arguments (they might come in fragments)
                                        if (!string.IsNullOrEmpty(toolCallDelta.Function.Arguments))
                                        {
                                            existingToolCall.Function!.Arguments =
                                                string.IsNullOrEmpty(existingToolCall.Function.Arguments)
                                                    ? toolCallDelta.Function.Arguments
                                                    : existingToolCall.Function.Arguments + toolCallDelta.Function.Arguments;
                                        }
                                    }
                                }
                            }

                            // Store finish reason if present
                            if (!string.IsNullOrEmpty(choice.FinishReason))
                            {
                                finishReason = choice.FinishReason;
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Log parsing errors with the problematic line
                    string errorMsg = $"Error parsing stream chunk: {ex.Message}\nPROBLEMATIC LINE: {line}\n\n";
                    Console.WriteLine(errorMsg);
                }
            }

            // Create the complete message from the buffered content
            var completeMessage = new Message
            {
                Role = "assistant",
                Content = contentBuffer.ToString()
            };

            // Handle tool calls (if any were detected)
            if (toolCallsById.Count > 0)
            {
                // Repair any missing function names or arguments
                foreach (var toolCall in toolCallsById.Values)
                {
                    if (toolCall.Function == null)
                    {
                        toolCall.Function = new FunctionCall();
                    }

                    // Set defaults for missing values
                    if (string.IsNullOrEmpty(toolCall.Function.Arguments))
                    {
                        toolCall.Function.Arguments = "{}";
                    }
                }


                // If we have both content and tool calls, keep both
                completeMessage.ToolCalls = toolCallsById.Values.ToArray();

            }

            return completeMessage;
        }

        public async Task<(ChatCompletionResponse, List<Message>)> ProcessMessageAsync(
            ChatCompletionRequest request,
            int maxToolCalls = 5,
            CancellationToken cancellationToken = default)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));

            // Add tools to request if any are registered
            if (_tools.Count > 0 && request.Tools == null)
            {
                request.Tools = _tools;
            }

            // Initialize state
            var toolCallsCount = 0;
            var hasToolCalls = false;
            ChatCompletionResponse? lastResponse = null;
            StreamState currentState = StreamState.Loading;

            // Notify of loading state
            RaiseEvent(StreamEventType.StateChange, currentState);

            do
            {
                // Check if we've reached the tool call limit
                if (toolCallsCount >= maxToolCalls)
                {
                    RaiseEvent(
                        StreamEventType.Error,
                        StreamState.Complete,
                        toolResult: $"Reached maximum tool call limit of {maxToolCalls}"
                    );
                    break;
                }

                // If streaming, handle the stream first
                if (request.Stream == true)
                {
                    // Switch to text state until we detect tool calls
                    currentState = StreamState.Text;
                    RaiseEvent(StreamEventType.StateChange, currentState);

                    hasToolCalls = false;

                    // Process the stream
                    var completeMessage = await StreamChatCompletionAsync(
                        request,
                        chunk =>
                        {
                            var choice = chunk.Choices?.FirstOrDefault();
                            if (choice?.Delta == null) return;

                            // Handle text content
                            if (!string.IsNullOrEmpty(choice.Delta.Content))
                            {
                                RaiseEvent(StreamEventType.TextContent, currentState, textDelta: choice.Delta.Content);
                            }

                            // Detect tool calls
                            if (choice.Delta.ToolCalls != null && choice.Delta.ToolCalls.Length > 0)
                            {
                                hasToolCalls = true;
                                currentState = StreamState.ToolCall;
                                RaiseEvent(StreamEventType.StateChange, currentState);
                            }

                            // Check for completion
                            if (choice.FinishReason == "tool_calls")
                            {
                                hasToolCalls = true;
                            }
                            else if (choice.FinishReason == "stop" || choice.FinishReason == "length")
                            {
                                currentState = StreamState.Complete;
                                RaiseEvent(StreamEventType.StateChange, currentState);
                            }
                        },
                        error =>
                        {
                            var errorMessage = "Sorry, we seem to be having some issues...\n" + error.Error?.Code + ": " + error.Error?.Message + "\n Please try again!";
                            // Notify of error
                            RaiseEvent(
                                StreamEventType.TextContent,
                                StreamState.Complete,
                                textDelta: errorMessage
                            );
                            request.Messages.Add(new Message
                            {
                                Role = "assistant",
                                Content = errorMessage
                            });

                        },
                        cancellationToken
                    );

                    // Add the complete message to conversation history
                    request.Messages.Add(completeMessage);

                    // Check if we need to process tool calls
                    hasToolCalls = completeMessage.ToolCalls != null && completeMessage.ToolCalls.Length > 0;

                    if (!hasToolCalls)
                    {
                        // No tool calls detected in stream, we're done
                        break;
                    }

                    // Create a minimal response for tool call processing
                    lastResponse = new ChatCompletionResponse
                    {
                        Id = "stream-processed",
                        Model = request.Model,
                        Object = "chat.completion",
                        Created = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                        Choices = new List<Choice>
                        {
                            new Choice
                            {
                                Index = 0,
                                FinishReason = "tool_calls",
                                Message = completeMessage
                            }
                        }
                    };
                }
                else
                {
                    // For non-streaming requests, just make the regular API call
                    lastResponse = await CreateChatCompletionAsync(request, cancellationToken);

                    // Add the assistant message to the conversation history
                    if (lastResponse?.Choices?.FirstOrDefault()?.Message != null)
                    {
                        request.Messages.Add(lastResponse.Choices.FirstOrDefault()!.Message!);
                    }
                }

                // Process tool calls if any
                var choice = lastResponse?.Choices?.FirstOrDefault();
                if (choice?.Message?.ToolCalls != null && choice.Message.ToolCalls.Length > 0)
                {
                    hasToolCalls = true;
                    toolCallsCount++;

                    // Process each tool call - the message is already added to the conversation
                    foreach (var toolCall in choice.Message.ToolCalls)
                    {
                        if (toolCall.Function != null)
                        {
                            try
                            {
                                // Get tool information
                                var toolName = toolCall.Function.Name;
                                var toolArgs = toolCall.Function.Arguments;

                                // Skip tool calls with missing data
                                if (string.IsNullOrEmpty(toolName))
                                {
                                    Console.WriteLine("Warning: Received tool call with missing function name, skipping.");
                                    continue;
                                }

                                // Notify of tool call
                                currentState = StreamState.ToolCall;
                                RaiseEvent(
                                    StreamEventType.ToolCall,
                                    currentState,
                                    toolName,
                                    toolCall: toolCall
                                );

                                // Execute the tool
                                var result = ExecuteTool(toolName, toolArgs!);

                                // Convert result to string
                                string resultString = (result is string str)
                                    ? str
                                    : JsonSerializer.Serialize(result, _jsonOptions);

                                // Notify of tool result
                                RaiseEvent(
                                    StreamEventType.ToolResult,
                                    currentState,
                                    toolName,
                                    toolCall: toolCall,
                                    toolResult: resultString
                                );

                                // Add tool result to conversation
                                request.Messages.Add(new Message
                                {
                                    Role = "tool",
                                    ToolCallId = toolCall.Id,
                                    Content = resultString
                                });
                            }
                            catch (Exception ex)
                            {
                                var errorMessage = $"Error executing tool: {ex.Message}";
                                Console.WriteLine($"Tool execution error: {ex}");

                                // Notify of error
                                RaiseEvent(
                                    StreamEventType.Error,
                                    currentState,
                                    toolCall?.Function?.Name,
                                    toolCall: toolCall,
                                    toolResult: errorMessage
                                );

                                // Add error as tool result
                                request.Messages.Add(new Message
                                {
                                    Role = "tool",
                                    ToolCallId = toolCall!.Id,
                                    Content = errorMessage
                                });
                            }
                        }
                    }
                }
                else
                {
                    // No tool calls, we're done
                    hasToolCalls = false;
                }

            } while (hasToolCalls && toolCallsCount < maxToolCalls);

            // Final state update
            RaiseEvent(StreamEventType.StateChange, StreamState.Complete);

            // For pure streaming without tool calls, we might not have a lastResponse
            // In that case, create a minimal response
            if (request.Stream == true && lastResponse == null)
            {
                lastResponse = new ChatCompletionResponse
                {
                    Id = "stream-response",
                    Model = request.Model,
                    Object = "chat.completion",
                    Created = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                    Choices = new List<Choice>
                    {
                        new Choice
                        {
                            Index = 0,
                            FinishReason = "stop",
                            Message = new Message
                            {
                                Role = "assistant",
                                Content = "[Streaming response completed]"
                            }
                        }
                    }
                };
            }

            return (lastResponse, request.Messages)!;
        }

        private void AddHeaders(HttpRequestMessage request)
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            if (!string.IsNullOrEmpty(_siteUrl))
            {
                request.Headers.Add("HTTP-Referer", _siteUrl);
            }

            if (!string.IsNullOrEmpty(_siteName))
            {
                request.Headers.Add("X-Title", _siteName);
            }
        }

        private void RaiseEvent(
            StreamEventType eventType,
            StreamState state,
            string? toolName = null,
            string? textDelta = null,
            ToolCall? toolCall = null,
            string? toolResult = null,
            object? originalResponse = null)
        {
            OnStreamEvent?.Invoke(this, new StreamEventArgs
            {
                EventType = eventType,
                State = state,
                ToolName = toolName,
                TextDelta = textDelta,
                ToolCall = toolCall,
                ToolResult = toolResult,
                OriginalResponse = originalResponse
            });
        }
    }
}