using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Source.Features.Kanban.Commands;
using Source.Features.Kanban.Queries;
using System.Security.Claims;

namespace Source.Features.Kanban.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // JWT auth required
public class KanbanController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<KanbanController> _logger;

    public KanbanController(
        IMediator mediator,
        ILogger<KanbanController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all boards for the current user
    /// </summary>
    [HttpGet("boards")]
    public async Task<ActionResult<List<KanbanBoardSummaryDto>>> GetUserBoards()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var query = new GetUserBoards(userId);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Get full board details with columns and tasks
    /// </summary>
    [HttpGet("boards/{boardId}")]
    public async Task<ActionResult<KanbanBoardDto>> GetBoard([FromRoute] Guid boardId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var query = new GetKanbanBoard(boardId, userId);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new board
    /// </summary>
    [HttpPost("boards")]
    public async Task<ActionResult<CreateBoardResponse>> CreateBoard([FromBody] CreateBoardRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new CreateBoard(userId, request.Title, request.Description ?? "");
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return CreatedAtAction(nameof(GetBoard), new { boardId = result.Value.BoardId }, result.Value);
    }

    /// <summary>
    /// Create a new task
    /// </summary>
    [HttpPost("boards/{boardId}/tasks")]
    public async Task<ActionResult<CreateTaskResponse>> CreateTask([FromRoute] Guid boardId, [FromBody] CreateTaskRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new CreateTask(boardId, userId, request.Title, request.Description ?? "", request.ColumnName ?? "TODO");
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Move a task to a different column
    /// </summary>
    [HttpPut("boards/{boardId}/tasks/{taskId}/move")]
    public async Task<ActionResult<MoveTaskResponse>> MoveTask([FromRoute] Guid boardId, [FromRoute] Guid taskId, [FromBody] MoveTaskRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new MoveTask(boardId, taskId, userId, request.TargetColumnName);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Add a subtask to a task
    /// </summary>
    [HttpPost("boards/{boardId}/tasks/{taskId}/subtasks")]
    public async Task<ActionResult<AddSubtaskResponse>> AddSubtask([FromRoute] Guid boardId, [FromRoute] Guid taskId, [FromBody] AddSubtaskRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new AddSubtask(boardId, taskId, userId, request.Title);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Toggle subtask completion
    /// </summary>
    [HttpPut("boards/{boardId}/tasks/{taskId}/subtasks/{subtaskIndex}/toggle")]
    public async Task<ActionResult<ToggleSubtaskResponse>> ToggleSubtask([FromRoute] Guid boardId, [FromRoute] Guid taskId, [FromRoute] int subtaskIndex)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new ToggleSubtask(boardId, taskId, userId, subtaskIndex);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }
}

/// <summary>
/// Request DTOs
/// </summary>
public record CreateBoardRequest(string Title, string? Description = null);
public record CreateTaskRequest(string Title, string? Description = null, string? ColumnName = null);
public record MoveTaskRequest(string TargetColumnName);
public record AddSubtaskRequest(string Title); 