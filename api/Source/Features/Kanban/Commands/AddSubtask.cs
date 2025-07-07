using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Kanban.Events;
using Source.Features.Kanban.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Kanban.Commands;

/// <summary>
/// Command to add a subtask to a kanban task
/// Part of the Kanban feature vertical slice
/// </summary>
public record AddSubtask(
    Guid BoardId,
    Guid TaskId,
    string UserId,
    string SubtaskTitle
) : ICommand<Result<AddSubtaskResponse>>;

/// <summary>
/// Response DTO for subtask addition
/// </summary>
public record AddSubtaskResponse(
    Guid TaskId,
    string TaskTitle,
    string SubtaskTitle,
    int SubtaskCount,
    DateTime AddedAt
);

/// <summary>
/// Handler for adding subtasks to kanban tasks
/// </summary>
public class AddSubtaskHandler : ICommandHandler<AddSubtask, Result<AddSubtaskResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly IMediator _mediator;
    private readonly ILogger<AddSubtaskHandler> _logger;

    public AddSubtaskHandler(
        ApplicationDbContext context,
        IMediator mediator,
        ILogger<AddSubtaskHandler> logger)
    {
        _context = context;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<AddSubtaskResponse>> Handle(AddSubtask request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.UserId))
                return Result.Failure<AddSubtaskResponse>("User ID is required");

            if (string.IsNullOrWhiteSpace(request.SubtaskTitle))
                return Result.Failure<AddSubtaskResponse>("Subtask title is required");

            if (request.SubtaskTitle.Length > 200)
                return Result.Failure<AddSubtaskResponse>("Subtask title too long (max 200 characters)");

            // Check if board exists and belongs to user
            var board = await _context.KanbanBoards
                .FirstOrDefaultAsync(b => b.Id == request.BoardId && b.UserId == request.UserId, cancellationToken);
            
            if (board == null)
                return Result.Failure<AddSubtaskResponse>("Board not found or access denied");

            // Find task
            var task = await _context.KanbanTasks
                .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.BoardId == request.BoardId, cancellationToken);

            if (task == null)
                return Result.Failure<AddSubtaskResponse>("Task not found");

            // Get current subtasks
            var subtasks = task.Subtasks;

            // Add new subtask
            var newSubtask = new KanbanSubtask
            {
                Title = request.SubtaskTitle.Trim(),
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow
            };

            subtasks.Add(newSubtask);

            // Update task
            task.Subtasks = subtasks;
            task.UpdatedAt = DateTime.UtcNow;

            // Update board timestamp
            board.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("➕ Subtask added: '{SubtaskTitle}' to task {TaskId}", 
                newSubtask.Title, task.Id);

            // Publish domain event for SignalR broadcasting
            await _mediator.Publish(new TaskUpdated(
                request.BoardId,
                task.Id,
                task.Title,
                "subtask_added",
                request.UserId,
                DateTime.UtcNow
            ), cancellationToken);

            return Result.Success(new AddSubtaskResponse(
                task.Id, 
                task.Title, 
                newSubtask.Title, 
                subtasks.Count, 
                newSubtask.CreatedAt));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to add subtask to task {TaskId}", request.TaskId);
            return Result.Failure<AddSubtaskResponse>("Failed to add subtask");
        }
    }
} 