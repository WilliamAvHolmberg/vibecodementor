using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Kanban.Events;
using Source.Features.Kanban.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Kanban.Commands;

/// <summary>
/// Command to move a task to a different column
/// Part of the Kanban feature vertical slice
/// </summary>
public record MoveTask(
    Guid BoardId,
    Guid TaskId,
    string UserId,
    string TargetColumnName
) : ICommand<Result<MoveTaskResponse>>;

/// <summary>
/// Response DTO for task movement
/// </summary>
public record MoveTaskResponse(
    Guid TaskId,
    string Title,
    string FromColumn,
    string ToColumn,
    DateTime MovedAt
);

/// <summary>
/// Handler for moving kanban tasks between columns
/// </summary>
public class MoveTaskHandler : ICommandHandler<MoveTask, Result<MoveTaskResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly IMediator _mediator;
    private readonly ILogger<MoveTaskHandler> _logger;

    public MoveTaskHandler(
        ApplicationDbContext context,
        IMediator mediator,
        ILogger<MoveTaskHandler> logger)
    {
        _context = context;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<MoveTaskResponse>> Handle(MoveTask request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.UserId))
                return Result.Failure<MoveTaskResponse>("User ID is required");

            if (string.IsNullOrWhiteSpace(request.TargetColumnName))
                return Result.Failure<MoveTaskResponse>("Target column is required");

            // Check if board exists and belongs to user
            var board = await _context.KanbanBoards
                .FirstOrDefaultAsync(b => b.Id == request.BoardId && b.UserId == request.UserId, cancellationToken);
            
            if (board == null)
                return Result.Failure<MoveTaskResponse>("Board not found or access denied");

            // Find task with current column info
            var task = await _context.KanbanTasks
                .Include(t => t.Column)
                .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.BoardId == request.BoardId, cancellationToken);

            if (task == null)
                return Result.Failure<MoveTaskResponse>("Task not found");

            // Find target column
            var targetColumn = await _context.KanbanColumns
                .FirstOrDefaultAsync(c => c.BoardId == request.BoardId && 
                                         c.Name.ToUpper() == request.TargetColumnName.ToUpper(), cancellationToken);

            if (targetColumn == null)
                return Result.Failure<MoveTaskResponse>($"Column '{request.TargetColumnName}' not found");

            // Skip if already in target column
            if (task.ColumnId == targetColumn.Id)
                return Result.Success(new MoveTaskResponse(task.Id, task.Title, task.Column.Name, targetColumn.Name, task.UpdatedAt));

            var fromColumnName = task.Column.Name;

            // Get next position in target column
            var maxPosition = await _context.KanbanTasks
                .Where(t => t.ColumnId == targetColumn.Id)
                .MaxAsync(t => (int?)t.Position, cancellationToken) ?? 0;

            // Move task
            task.ColumnId = targetColumn.Id;
            task.Position = maxPosition + 1;
            task.UpdatedAt = DateTime.UtcNow;

            // Update board timestamp
            board.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("🔄 Kanban task moved: {TaskId} from {FromColumn} to {ToColumn}", 
                task.Id, fromColumnName, targetColumn.Name);

            // Publish domain event for SignalR broadcasting
            await _mediator.Publish(new TaskMoved(
                request.BoardId,
                task.Id,
                task.Title,
                fromColumnName,
                targetColumn.Name,
                request.UserId,
                DateTime.UtcNow
            ), cancellationToken);

            return Result.Success(new MoveTaskResponse(task.Id, task.Title, fromColumnName, targetColumn.Name, task.UpdatedAt));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to move kanban task {TaskId}", request.TaskId);
            return Result.Failure<MoveTaskResponse>("Failed to move task");
        }
    }
} 