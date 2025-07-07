using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Kanban.Events;
using Source.Features.Kanban.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Kanban.Commands;

/// <summary>
/// Command to create a new task in a kanban board
/// Part of the Kanban feature vertical slice
/// </summary>
public record CreateTask(
    Guid BoardId,
    string UserId,
    string Title,
    string Description = "",
    string ColumnName = "TODO"
) : ICommand<Result<CreateTaskResponse>>;

/// <summary>
/// Response DTO for task creation
/// </summary>
public record CreateTaskResponse(
    Guid TaskId,
    string Title,
    string ColumnName,
    DateTime CreatedAt
);

/// <summary>
/// Handler for creating kanban tasks
/// </summary>
public class CreateTaskHandler : ICommandHandler<CreateTask, Result<CreateTaskResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly IMediator _mediator;
    private readonly ILogger<CreateTaskHandler> _logger;

    public CreateTaskHandler(
        ApplicationDbContext context,
        IMediator mediator,
        ILogger<CreateTaskHandler> logger)
    {
        _context = context;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<CreateTaskResponse>> Handle(CreateTask request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.UserId))
                return Result.Failure<CreateTaskResponse>("User ID is required");

            if (string.IsNullOrWhiteSpace(request.Title))
                return Result.Failure<CreateTaskResponse>("Task title is required");

            if (request.Title.Length > 200)
                return Result.Failure<CreateTaskResponse>("Task title too long (max 200 characters)");

            // Check if board exists and belongs to user
            var board = await _context.KanbanBoards
                .FirstOrDefaultAsync(b => b.Id == request.BoardId && b.UserId == request.UserId, cancellationToken);
            
            if (board == null)
                return Result.Failure<CreateTaskResponse>("Board not found or access denied");

            // Find target column
            var column = await _context.KanbanColumns
                .FirstOrDefaultAsync(c => c.BoardId == request.BoardId && 
                                         c.Name.ToUpper() == request.ColumnName.ToUpper(), cancellationToken);

            if (column == null)
                return Result.Failure<CreateTaskResponse>($"Column '{request.ColumnName}' not found");

            // Get next position in column
            var maxPosition = await _context.KanbanTasks
                .Where(t => t.ColumnId == column.Id)
                .MaxAsync(t => (int?)t.Position, cancellationToken) ?? 0;

            // Create task
            var task = new KanbanTask
            {
                Id = Guid.NewGuid(),
                BoardId = request.BoardId,
                ColumnId = column.Id,
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                Position = maxPosition + 1,
                SubtasksJson = "[]",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.KanbanTasks.Add(task);

            // Update board timestamp
            board.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("📝 Kanban task created: {TaskId} in column {ColumnName}", 
                task.Id, column.Name);

            // Publish domain event for SignalR broadcasting
            await _mediator.Publish(new TaskCreated(
                request.BoardId,
                task.Id,
                task.Title,
                column.Name,
                request.UserId,
                DateTime.UtcNow
            ), cancellationToken);

            return Result.Success(new CreateTaskResponse(task.Id, task.Title, column.Name, task.CreatedAt));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to create kanban task for board {BoardId}", request.BoardId);
            return Result.Failure<CreateTaskResponse>("Failed to create task");
        }
    }
} 