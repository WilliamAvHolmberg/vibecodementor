using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Kanban.Events;
using Source.Features.Kanban.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Kanban.Commands;

/// <summary>
/// Command to toggle a subtask completion status
/// Part of the Kanban feature vertical slice
/// </summary>
public record ToggleSubtask(
    Guid BoardId,
    Guid TaskId,
    string UserId,
    int SubtaskIndex
) : ICommand<Result<ToggleSubtaskResponse>>;

/// <summary>
/// Response DTO for subtask toggle
/// </summary>
public record ToggleSubtaskResponse(
    Guid TaskId,
    string TaskTitle,
    string SubtaskTitle,
    bool IsCompleted,
    DateTime ToggledAt
);

/// <summary>
/// Handler for toggling subtask completion
/// </summary>
public class ToggleSubtaskHandler : ICommandHandler<ToggleSubtask, Result<ToggleSubtaskResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly IMediator _mediator;
    private readonly ILogger<ToggleSubtaskHandler> _logger;

    public ToggleSubtaskHandler(
        ApplicationDbContext context,
        IMediator mediator,
        ILogger<ToggleSubtaskHandler> logger)
    {
        _context = context;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<ToggleSubtaskResponse>> Handle(ToggleSubtask request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.UserId))
                return Result.Failure<ToggleSubtaskResponse>("User ID is required");

            if (request.SubtaskIndex < 0)
                return Result.Failure<ToggleSubtaskResponse>("Subtask index must be non-negative");

            // Check if board exists and belongs to user
            var board = await _context.KanbanBoards
                .FirstOrDefaultAsync(b => b.Id == request.BoardId && b.UserId == request.UserId, cancellationToken);
            
            if (board == null)
                return Result.Failure<ToggleSubtaskResponse>("Board not found or access denied");

            // Find task
            var task = await _context.KanbanTasks
                .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.BoardId == request.BoardId, cancellationToken);

            if (task == null)
                return Result.Failure<ToggleSubtaskResponse>("Task not found");

            // Get current subtasks
            var subtasks = task.Subtasks;

            // Validate subtask index
            if (request.SubtaskIndex >= subtasks.Count)
                return Result.Failure<ToggleSubtaskResponse>("Subtask index out of range");

            // Toggle subtask
            var subtask = subtasks[request.SubtaskIndex];
            subtask.IsCompleted = !subtask.IsCompleted;
            subtask.CompletedAt = subtask.IsCompleted ? DateTime.UtcNow : null;

            // Update task
            task.Subtasks = subtasks;
            task.UpdatedAt = DateTime.UtcNow;

            // Update board timestamp
            board.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("✅ Subtask toggled: '{SubtaskTitle}' in task {TaskId} -> {IsCompleted}", 
                subtask.Title, task.Id, subtask.IsCompleted);

            // Publish domain event for SignalR broadcasting
            await _mediator.Publish(new TaskUpdated(
                request.BoardId,
                task.Id,
                task.Title,
                "subtask_toggled",
                request.UserId,
                DateTime.UtcNow
            ), cancellationToken);

            return Result.Success(new ToggleSubtaskResponse(
                task.Id, 
                task.Title, 
                subtask.Title, 
                subtask.IsCompleted, 
                DateTime.UtcNow));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to toggle subtask in task {TaskId}", request.TaskId);
            return Result.Failure<ToggleSubtaskResponse>("Failed to toggle subtask");
        }
    }
} 