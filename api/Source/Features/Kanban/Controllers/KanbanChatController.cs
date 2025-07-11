using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Http.Features;
using Source.Features.Kanban.Hubs;
using Source.Features.Kanban.Tools;
using Source.Features.Kanban.Commands;
using Source.Features.Kanban.Queries;
using Api.Features.OpenRouter.Services;
using Api.Features.OpenRouter.Models;
using Api.Features.OpenRouter;
using Api.Features.OpenRouter.Tools;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using MediatR;

namespace Source.Features.Kanban.Controllers;

public record CreateChatSessionRequest(Guid BoardId);

public record GetChatSessionMessagesResponse(Guid SessionId, Guid BoardId, List<ChatMessageResponseDto> Messages);

public record ChatMessageResponseDto(Guid Id, string Role, string Content, int Order, DateTime CreatedAt);

public record GetCurrentChatSessionResponse(Guid SessionId, Guid BoardId, DateTime CreatedAt, DateTime UpdatedAt, int MessageCount);

public record GetBoardChatSessionsResponse(Guid BoardId, Guid? CurrentSessionId, List<ChatSessionSummaryResponseDto> Sessions);

public record ChatSessionSummaryResponseDto(Guid SessionId, DateTime CreatedAt, DateTime UpdatedAt, int MessageCount, bool IsCurrent);

[ApiController]
[Route("api/kanban")]
[Authorize] // JWT auth required
public class KanbanChatController : ControllerBase
{
    private readonly ILogger<KanbanChatController> _logger;
    private readonly IConfiguration _configuration;
    private readonly IHubContext<KanbanHub> _hubContext;
    private readonly OpenRouterClient _openRouterClient;
    private readonly IMediator _mediator;

    public KanbanChatController(
        ILogger<KanbanChatController> logger,
        IConfiguration configuration,
        IHubContext<KanbanHub> hubContext,
        OpenRouterClient openRouterClient,
        IMediator mediator)
    {
        _logger = logger;
        _configuration = configuration;
        _hubContext = hubContext;
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
                    // Direct pass-through of events for streaming
                    await WriteStreamEvent(e.EventType.ToString(), e);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error handling stream event");
                    await WriteErrorEvent($"Error handling stream event: {ex.Message}");
                }
            };

            // Get or create chat session for this board
            Guid sessionId;
            if (Guid.TryParse(conversationId, out var parsedConversationId))
            {
                sessionId = parsedConversationId;
            }
            else
            {
                // Create new session if conversationId is not a valid GUID
                var boardGuid = Guid.TryParse(boardId, out var parsedBoardId) ? parsedBoardId : Guid.Empty;
                if (boardGuid == Guid.Empty)
                {
                    await WriteErrorEvent("Board ID is required for new chat sessions");
                    return;
                }

                var createSessionResult = await _mediator.Send(new CreateChatSessionCommand(boardGuid, userId));
                if (!createSessionResult.IsSuccess)
                {
                    await WriteErrorEvent($"Failed to create chat session: {createSessionResult.Error}");
                    return;
                }
                sessionId = createSessionResult.Value.SessionId;
            }

            // Get existing messages from database
            var messagesResult = await _mediator.Send(new GetChatMessagesQuery(sessionId, userId));
            if (!messagesResult.IsSuccess)
            {
                await WriteErrorEvent($"Failed to load chat history: {messagesResult.Error}");
                return;
            }

            // DEBUG: Log loaded messages from database
            _logger.LogInformation("Loaded {MessageCount} messages from database for session {SessionId}", 
                messagesResult.Value.Messages.Count, sessionId);
            
            var messages = messagesResult.Value.Messages
                .Select(m => new Message { 
                    Role = m.Role, 
                    Content = m.Content,
                    ToolCallId = m.ToolCallId
                })
                .ToList();

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

                // CRITICAL: System message must be FIRST, not last
                messages.Insert(0, Message.FromSystem(systemMessage));
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

            // DEBUG: Log what we're sending to OpenRouter
            _logger.LogInformation("Sending {MessageCount} messages to OpenRouter:", messages.Count);
            for (int i = 0; i < messages.Count; i++)
            {
                var msg = messages[i];
                var contentStr = msg.Content?.ToString() ?? "";
                var preview = contentStr.Length > 100 ? contentStr.Substring(0, 100) + "..." : contentStr;
                _logger.LogInformation("Message {Index}: Role={Role}, Content={Preview}", i, msg.Role, preview);
            }

            try
            {
                // Save user message first
                await _mediator.Send(new SaveChatMessageCommand(sessionId, userId, "user", message));

                // Start streaming with events
                var (response, finalMessages) = await client.ProcessMessageAsync(chatRequest, maxToolCalls: 10, cancellationToken);
                
                // Save all new messages to database (skip the ones we already loaded from DB)
                // The finalMessages will contain: [DB messages] + [system message if added] + [user message] + [new assistant/tool messages]
                var dbMessageCount = messagesResult.Value.Messages.Count;
                var systemMessageAdded = !messagesResult.Value.Messages.Any(m => m.Role.Equals("system", StringComparison.OrdinalIgnoreCase)) ? 1 : 0;
                var skipCount = dbMessageCount + systemMessageAdded + 1; // +1 for user message we just added
                
                for (int i = skipCount; i < finalMessages.Count; i++)
                {
                    var msg = finalMessages[i];
                    // Save with correct role and ToolCallId (if present)
                    await _mediator.Send(new SaveChatMessageCommand(sessionId, userId, msg.Role!, msg.Content?.ToString() ?? "", msg.ToolCallId));
                }
                
                // Send a final "done" event
                await WriteStreamEvent("done", new { sessionId = sessionId });
            }
            catch (HttpRequestException httpEx)
            {
                _logger.LogError(httpEx, "HTTP error from OpenRouter API. Status: {Message}", httpEx.Message);
                await WriteErrorEvent($"OpenRouter API Error: {httpEx.Message}");
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
    /// Get conversation history for a kanban chat session
    /// </summary>
    [HttpGet("chat/sessions/{sessionId}/messages")]
    public async Task<ActionResult<GetChatSessionMessagesResponse>> GetChatSessionMessages([FromRoute] string sessionId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        if (!Guid.TryParse(sessionId, out var sessionGuid))
            return BadRequest("Invalid session ID");

        var result = await _mediator.Send(new GetChatMessagesQuery(sessionGuid, userId));
        if (!result.IsSuccess)
            return BadRequest(result.Error);

        // Filter out system messages for frontend display and map to response DTOs
        var userMessages = result.Value.Messages
            .Where(m => m.Role != "system")
            .Select(m => new ChatMessageResponseDto(m.Id, m.Role, m.Content, m.Order, m.CreatedAt))
            .ToList();
        
        return Ok(new GetChatSessionMessagesResponse(result.Value.SessionId, result.Value.BoardId, userMessages));
    }

    /// <summary>
    /// Create a new chat session for a board
    /// </summary>
    [HttpPost("chat/sessions")]
    public async Task<ActionResult<CreateChatSessionResponse>> CreateChatSession([FromBody] CreateChatSessionRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _mediator.Send(new CreateChatSessionCommand(request.BoardId, userId));
        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetChatSessionMessages), new { sessionId = result.Value.SessionId }, result.Value);
    }

    /// <summary>
    /// Get current chat session for a board
    /// </summary>
    [HttpGet("boards/{boardId}/current-session")]
    public async Task<ActionResult<GetCurrentChatSessionResponse?>> GetCurrentChatSession([FromRoute] string boardId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        if (!Guid.TryParse(boardId, out var boardGuid))
            return BadRequest("Invalid board ID");

        var result = await _mediator.Send(new GetCurrentChatSessionQuery(boardGuid, userId));
        if (!result.IsSuccess)
            return BadRequest(result.Error);

        // Map to response DTO if session exists
        if (result.Value == null)
            return Ok((GetCurrentChatSessionResponse?)null);

        var response = new GetCurrentChatSessionResponse(
            result.Value.SessionId,
            result.Value.BoardId,
            result.Value.CreatedAt,
            result.Value.UpdatedAt,
            result.Value.MessageCount
        );

        return Ok(response);
    }

    /// <summary>
    /// Get all chat sessions for a board
    /// </summary>
    [HttpGet("boards/{boardId}/sessions")]
    public async Task<ActionResult<GetBoardChatSessionsResponse>> GetBoardChatSessions([FromRoute] string boardId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        if (!Guid.TryParse(boardId, out var boardGuid))
            return BadRequest("Invalid board ID");

        var result = await _mediator.Send(new GetBoardChatSessionsQuery(boardGuid, userId));
        if (!result.IsSuccess)
            return BadRequest(result.Error);

        // Map to response DTOs
        var sessionDtos = result.Value.Sessions
            .Select(s => new ChatSessionSummaryResponseDto(s.SessionId, s.CreatedAt, s.UpdatedAt, s.MessageCount, s.IsCurrent))
            .ToList();

        var response = new GetBoardChatSessionsResponse(result.Value.BoardId, result.Value.CurrentSessionId, sessionDtos);

        return Ok(response);
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