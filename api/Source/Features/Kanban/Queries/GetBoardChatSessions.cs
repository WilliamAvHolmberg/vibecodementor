using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Kanban.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Kanban.Queries;

public record GetBoardChatSessionsQuery(Guid BoardId, string UserId) : IQuery<Result<GetBoardChatSessionsResponse>>;

public record GetBoardChatSessionsResponse(
    Guid BoardId,
    Guid? CurrentSessionId,
    List<ChatSessionSummaryDto> Sessions
);

public record ChatSessionSummaryDto(
    Guid SessionId,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int MessageCount,
    bool IsCurrent
);

public class GetBoardChatSessionsQueryHandler : IQueryHandler<GetBoardChatSessionsQuery, Result<GetBoardChatSessionsResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<GetBoardChatSessionsQueryHandler> _logger;

    public GetBoardChatSessionsQueryHandler(ApplicationDbContext context, ILogger<GetBoardChatSessionsQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<GetBoardChatSessionsResponse>> Handle(GetBoardChatSessionsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // Verify board exists and user has access
            var board = await _context.KanbanBoards
                .FirstOrDefaultAsync(b => b.Id == request.BoardId && b.UserId == request.UserId && b.IsActive, cancellationToken);

            if (board == null)
            {
                return Result.Failure<GetBoardChatSessionsResponse>("Board not found or access denied");
            }

            // Get all sessions for this board, ordered by most recent first
            var sessions = await _context.KanbanChatSessions
                .Where(s => s.BoardId == request.BoardId && s.IsActive)
                .OrderByDescending(s => s.UpdatedAt)
                .Select(s => new ChatSessionSummaryDto(
                    s.Id,
                    s.CreatedAt,
                    s.UpdatedAt,
                    s.Messages.Count(),
                    s.Id == board.CurrentSessionId
                ))
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {SessionCount} chat sessions for board {BoardId}", sessions.Count, request.BoardId);

            return Result.Success(new GetBoardChatSessionsResponse(board.Id, board.CurrentSessionId, sessions));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving chat sessions for board {BoardId}", request.BoardId);
            return Result.Failure<GetBoardChatSessionsResponse>("Failed to retrieve chat sessions");
        }
    }
} 