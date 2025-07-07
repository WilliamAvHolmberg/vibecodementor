using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Kanban.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Kanban.Queries;

/// <summary>
/// Query to get full kanban board details with columns and tasks
/// Part of the Kanban feature vertical slice
/// </summary>
public record GetKanbanBoard(
    Guid BoardId,
    string UserId
) : IQuery<Result<KanbanBoardDto>>;

/// <summary>
/// DTO for full board details
/// </summary>
public record KanbanBoardDto(
    Guid Id,
    string Title,
    string Description,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<KanbanColumnDto> Columns
);

/// <summary>
/// DTO for column details
/// </summary>
public record KanbanColumnDto(
    Guid Id,
    string Name,
    int Order,
    bool IsCompleted,
    List<KanbanTaskDto> Tasks
);

/// <summary>
/// DTO for task details
/// </summary>
public record KanbanTaskDto(
    Guid Id,
    string Title,
    string Description,
    int Position,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<KanbanSubtaskDto> Subtasks
);

/// <summary>
/// DTO for subtask details
/// </summary>
public record KanbanSubtaskDto(
    string Title,
    bool IsCompleted,
    DateTime CreatedAt,
    DateTime? CompletedAt
);

/// <summary>
/// Handler for retrieving full kanban board details
/// </summary>
public class GetKanbanBoardHandler : IQueryHandler<GetKanbanBoard, Result<KanbanBoardDto>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<GetKanbanBoardHandler> _logger;

    public GetKanbanBoardHandler(
        ApplicationDbContext context,
        ILogger<GetKanbanBoardHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<KanbanBoardDto>> Handle(GetKanbanBoard request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.UserId))
                return Result.Failure<KanbanBoardDto>("User ID is required");

            // Get board with all related data
            var board = await _context.KanbanBoards
                .Include(b => b.Columns)
                .ThenInclude(c => c.Tasks)
                .FirstOrDefaultAsync(b => b.Id == request.BoardId && b.UserId == request.UserId && b.IsActive, cancellationToken);

            if (board == null)
                return Result.Failure<KanbanBoardDto>("Board not found or access denied");

            // Convert to DTO
            var boardDto = new KanbanBoardDto(
                board.Id,
                board.Title,
                board.Description,
                board.CreatedAt,
                board.UpdatedAt,
                board.Columns
                    .OrderBy(c => c.Order)
                    .Select(c => new KanbanColumnDto(
                        c.Id,
                        c.Name,
                        c.Order,
                        c.IsCompleted,
                        c.Tasks
                            .OrderBy(t => t.Position)
                            .Select(t => new KanbanTaskDto(
                                t.Id,
                                t.Title,
                                t.Description,
                                t.Position,
                                t.CreatedAt,
                                t.UpdatedAt,
                                t.Subtasks.Select(s => new KanbanSubtaskDto(
                                    s.Title,
                                    s.IsCompleted,
                                    s.CreatedAt,
                                    s.CompletedAt
                                )).ToList()
                            )).ToList()
                    )).ToList()
            );

            _logger.LogInformation("📋 Retrieved board {BoardId} with {ColumnCount} columns and {TaskCount} tasks", 
                board.Id, boardDto.Columns.Count, boardDto.Columns.Sum(c => c.Tasks.Count));

            return Result.Success(boardDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to retrieve board {BoardId}", request.BoardId);
            return Result.Failure<KanbanBoardDto>("Failed to retrieve board");
        }
    }
} 