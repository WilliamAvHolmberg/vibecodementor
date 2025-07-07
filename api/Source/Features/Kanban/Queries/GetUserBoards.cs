using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Kanban.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Kanban.Queries;

/// <summary>
/// Query to get all kanban boards for a user
/// Part of the Kanban feature vertical slice
/// </summary>
public record GetUserBoards(
    string UserId
) : IQuery<Result<List<KanbanBoardSummaryDto>>>;

/// <summary>
/// DTO for board summary in list view
/// </summary>
public record KanbanBoardSummaryDto(
    Guid Id,
    string Title,
    string Description,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int TaskCount,
    int CompletedTaskCount
);

/// <summary>
/// Handler for retrieving user's kanban boards
/// </summary>
public class GetUserBoardsHandler : IQueryHandler<GetUserBoards, Result<List<KanbanBoardSummaryDto>>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<GetUserBoardsHandler> _logger;

    public GetUserBoardsHandler(
        ApplicationDbContext context,
        ILogger<GetUserBoardsHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<List<KanbanBoardSummaryDto>>> Handle(GetUserBoards request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.UserId))
                return Result.Failure<List<KanbanBoardSummaryDto>>("User ID is required");

            // First, get the basic board information
            var boards = await _context.KanbanBoards
                .Where(b => b.UserId == request.UserId && b.IsActive)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Description,
                    b.CreatedAt,
                    b.UpdatedAt
                })
                .OrderByDescending(b => b.UpdatedAt)
                .ToListAsync(cancellationToken);

            // If no boards, return empty list
            if (!boards.Any())
            {
                _logger.LogInformation("📋 No boards found for user {UserId}", request.UserId);
                return Result.Success(new List<KanbanBoardSummaryDto>());
            }

            var boardIds = boards.Select(b => b.Id).ToList();

            // Get task counts for each board
            var taskCounts = await _context.KanbanTasks
                .Where(t => boardIds.Contains(t.BoardId))
                .GroupBy(t => t.BoardId)
                .Select(g => new
                {
                    BoardId = g.Key,
                    TotalTasks = g.Count()
                })
                .ToListAsync(cancellationToken);

            // Get completed task counts (tasks in completed columns)
            var completedTaskCounts = await _context.KanbanTasks
                .Include(t => t.Column)
                .Where(t => boardIds.Contains(t.BoardId) && t.Column.IsCompleted)
                .GroupBy(t => t.BoardId)
                .Select(g => new
                {
                    BoardId = g.Key,
                    CompletedTasks = g.Count()
                })
                .ToListAsync(cancellationToken);

            // Combine the data into DTOs
            var result = boards.Select(board =>
            {
                var taskCount = taskCounts.FirstOrDefault(tc => tc.BoardId == board.Id)?.TotalTasks ?? 0;
                var completedCount = completedTaskCounts.FirstOrDefault(cc => cc.BoardId == board.Id)?.CompletedTasks ?? 0;

                return new KanbanBoardSummaryDto(
                    board.Id,
                    board.Title,
                    board.Description,
                    board.CreatedAt,
                    board.UpdatedAt,
                    taskCount,
                    completedCount
                );
            }).ToList();

            _logger.LogInformation("📋 Retrieved {Count} boards for user {UserId}", result.Count, request.UserId);

            return Result.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to retrieve boards for user {UserId}", request.UserId);
            return Result.Failure<List<KanbanBoardSummaryDto>>("Failed to retrieve boards");
        }
    }
} 