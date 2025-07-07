using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Http.Features;
using Source.Features.Kanban.Hubs;
using Source.Features.Kanban.Tools;
using Api.Features.OpenRouter.Services;
using Api.Features.OpenRouter.Models;
using Api.Features.OpenRouter;
using Api.Features.OpenRouter.Tools;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using MediatR;

namespace Source.Features.Kanban.Controllers;

[ApiController]
[Route("api/kanban")]
[Authorize] // JWT auth required
public class KanbanChatController : ControllerBase
{
    private readonly ILogger<KanbanChatController> _logger;
    private readonly IConfiguration _configuration;
    private readonly IHubContext<KanbanHub> _hubContext;
    private readonly ConversationCacheService _conversationCache;
    private readonly OpenRouterClient _openRouterClient;
    private readonly IMediator _mediator;

    public KanbanChatController(
        ILogger<KanbanChatController> logger,
        IConfiguration configuration,
        IHubContext<KanbanHub> hubContext,
        ConversationCacheService conversationCache,
        OpenRouterClient openRouterClient,
        IMediator mediator)
    {
        _logger = logger;
        _configuration = configuration;
        _hubContext = hubContext;
        _conversationCache = conversationCache;
        _openRouterClient = openRouterClient;
        _mediator = mediator;
    }

    [HttpGet("chat/stream")]
    public async Task ChatWithKanbanStream(
        [FromQuery] string conversationId,
        [FromQuery] string message,
        [FromQuery] string? boardId = null,
        CancellationToken cancellationToken = default,
        [FromQuery] string model = "google/gemini-2.5-flash")
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Console.WriteLine("userId: " + userId);
            if (string.IsNullOrEmpty(userId))
            {
                Response.StatusCode = 401;
                return;
            }

            // CRITICAL: Disable response buffering for streaming
            var bufferingFeature = HttpContext.Features.Get<IHttpResponseBodyFeature>();
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

            // Create a new client instance for this request
            var client = new OpenRouterClient(_configuration, new HttpClient());

            // Register kanban tools with current user context
            var loggerFactory = HttpContext.RequestServices.GetRequiredService<ILoggerFactory>();
            var kanbanToolsLogger = loggerFactory.CreateLogger<KanbanTools>();
            var kanbanTools = new KanbanTools(_mediator, kanbanToolsLogger);
            
            // Set user context for the tools
            kanbanTools.SetUserContext(userId);
            
            // Register all kanban function tools using simple wrapper methods
            client.RegisterTool<string, Task<CreateBoardResult>>(kanbanTools.CreateBoardSimple);
            client.RegisterTool<string, Task<CreateTaskResult>>(kanbanTools.CreateTaskSimple);
            client.RegisterTool<string, Task<MoveTaskResult>>(kanbanTools.MoveTaskSimple);
            client.RegisterTool<string, Task<AddSubtaskResult>>(kanbanTools.AddSubtaskSimple);
            client.RegisterTool<string, Task<ToggleSubtaskResult>>(kanbanTools.ToggleSubtaskSimple);
            client.RegisterTool<string, Task<GetBoardsResult>>(kanbanTools.GetMyBoards);
            client.RegisterTool<string, Task<GetBoardDetailsResult>>(kanbanTools.GetBoardDetailsSimple);

            // Subscribe to streaming events
            client.OnStreamEvent += async (sender, e) =>
            {
                try
                {
                    // Send real-time updates to SignalR if boardId is provided
                    if (!string.IsNullOrEmpty(boardId))
                    {
                        await _hubContext.Clients.Group($"Board_{boardId}")
                            .SendAsync("KanbanUpdate", new { EventType = e.EventType, Data = e }, cancellationToken);
                    }

                    // Direct pass-through of events for streaming
                    await WriteStreamEvent(e.EventType.ToString(), e);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error handling stream event");
                    await WriteErrorEvent($"Error handling stream event: {ex.Message}");
                }
            };

            // Build conversation messages
            var conversationKey = $"kanban_{conversationId}";
            var messages = _conversationCache.GetMessages(conversationKey);

            // Add default system message for kanban tools if no previous messages with system role
            if (!messages.Any(m => m.Role!.Equals("system", StringComparison.OrdinalIgnoreCase)))
            {
                var systemMessage = $@"You are an expert kanban board assistant and project planning partner with access to kanban management tools. 
You excel at both executing kanban operations AND helping users plan, refine, and break down their work effectively.

Current user ID: {userId}
Current board ID: {boardId ?? "Not specified"}
Current date: {DateTime.Now:yyyy-MM-dd}

Available columns: TODO, IN_PROGRESS, DONE

## CORE CAPABILITIES:
- Create new boards
- Create tasks in any column (TODO, IN_PROGRESS, DONE)
- Move tasks between columns
- Add subtasks to tasks
- Toggle subtask completion
- Get board details and lists
- Provide insights and suggestions

## PLANNING EXPERT MODE:
You are also a world-class project planner and collaborator. When users mention wanting to create tasks or work on projects:

### WHEN TO HELP PLAN:
- User says they want to ""create a task"" but gives vague details
- User mentions a project or goal without clear next steps
- User seems unsure about how to break down their work
- User asks for help organizing or structuring their tasks

### HOW TO HELP PLAN:
- Start with the BIG PICTURE: ""What do you want to achieve?"" ""What's the goal here?""
- Focus on OUTCOMES and WHY before getting into implementation details
- Ask about the impact, the result they're looking for, the problem they're solving
- THEN help break it down into actionable steps and structure
- Suggest realistic approaches and alternatives
- Administrative details (titles, descriptions, columns) come LAST, not first

### CONVERSATION FLOW MINDSET:
- ALWAYS start with goals and outcomes, not forms and fields
- ""What do you want to achieve?"" beats ""What's the title?"" every time
- Think like a coach/consultant, not a data entry clerk
- Help users clarify their thinking and direction first
- Titles, descriptions, and columns are just implementation details that flow naturally from the real goal

### RESPECT USER AUTONOMY:
- If user says ""create it now"" or ""just do it"" - execute immediately without more questions
- If user provides clear, specific instructions - follow them exactly
- User is always right about their own needs and priorities
- Balance helpfulness with efficiency based on user's tone and urgency

## TECHNICAL WORKFLOW RULES:
1. When users refer to tasks by title (e.g., ""add subtask to create x post""), you MUST:
   - First use GetBoardDetailsSimple to fetch all tasks on the current board
   - Search through the tasks to find the one with matching title (case-insensitive partial match)
   - Use the found task ID for the operation
   - NEVER ask the user for task IDs - always look them up yourself

2. When a boardId is not specified in context, use GetMyBoards to find available boards

3. For task operations requiring IDs (move, add subtask, toggle subtask):
   - Always fetch board details first if you don't have the task ID
   - Match task titles intelligently (partial matches, ignore case)
   - If multiple tasks match, pick the most relevant one or ask for clarification

4. Always confirm what you did after performing actions

## COMMUNICATION STYLE:
- Be conversational, enthusiastic, and collaborative
- Ask thoughtful questions that help users think through their work
- Offer specific, actionable suggestions
- Show genuine interest in helping users succeed
- Balance being helpful with being efficient

Remember: You're not just a tool executor - you're a trusted planning partner who helps users organize their work effectively while respecting their autonomy and preferences!";

                messages.Add(Message.FromSystem(systemMessage));
            }

            // Add current user message
            messages.Add(Message.FromUser(message));

            // Create request object
            var chatRequest = new ChatCompletionRequest
            {
                Model = model,
                Messages = messages,
                Temperature = 0.7f,
                MaxTokens = 1500,
                Stream = true
            };

            try
            {
                // Start streaming with events
                var (response, finalMessages) = await client.ProcessMessageAsync(chatRequest, maxToolCalls: 10, cancellationToken);
                _conversationCache.SetMessages(conversationKey, finalMessages);
                
                // Send a final "done" event
                await WriteStreamEvent("done", new { });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing kanban chat message stream");
                await WriteErrorEvent($"Error in OpenRouter API: {ex.Message}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in kanban streaming chat endpoint");
            await WriteErrorEvent(ex.Message);
        }
    }

    /// <summary>
    /// Get conversation history for a kanban chat
    /// </summary>
    [HttpGet("chat/conversations/{conversationId}")]
    public IActionResult GetKanbanConversation([FromRoute] string conversationId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var conversationKey = $"kanban_{conversationId}";
        var messages = _conversationCache.GetMessages(conversationKey)
            .Where(m => m.Role != "system")
            .ToList();
        
        return Ok(messages);
    }

    /// <summary>
    /// Clear conversation history for a kanban chat
    /// </summary>
    [HttpDelete("chat/conversations/{conversationId}")]
    public IActionResult ClearKanbanConversation([FromRoute] string conversationId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var conversationKey = $"kanban_{conversationId}";
        _conversationCache.SetMessages(conversationKey, new List<Message>());
        
        return Ok(new { message = "Conversation cleared" });
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