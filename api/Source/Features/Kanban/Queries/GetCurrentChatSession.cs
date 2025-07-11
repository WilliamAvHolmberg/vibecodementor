using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Kanban.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Kanban.Queries;

public record GetCurrentChatSessionQuery(Guid BoardId, string UserId) : IQuery<Result<GetCurrentChatSessionResponse?>>;

public record GetCurrentChatSessionResponse(
    Guid SessionId,
    Guid BoardId,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int MessageCount
);

public class GetCurrentChatSessionQueryHandler : IQueryHandler<GetCurrentChatSessionQuery, Result<GetCurrentChatSessionResponse?>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<GetCurrentChatSessionQueryHandler> _logger;

    public GetCurrentChatSessionQueryHandler(ApplicationDbContext context, ILogger<GetCurrentChatSessionQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<GetCurrentChatSessionResponse?>> Handle(GetCurrentChatSessionQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // Verify board exists and user has access
            var board = await _context.KanbanBoards
                .FirstOrDefaultAsync(b => b.Id == request.BoardId && b.UserId == request.UserId && b.IsActive, cancellationToken);

            if (board == null)
            {
                return Result.Failure<GetCurrentChatSessionResponse?>("Board not found or access denied");
            }

            // Return null if no current session
            if (board.CurrentSessionId == null)
            {
                return Result.Success<GetCurrentChatSessionResponse?>(null);
            }

            // Get current session details
            var session = await _context.KanbanChatSessions
                .Where(s => s.Id == board.CurrentSessionId.Value && s.IsActive)
                .Select(s => new
                {
                    s.Id,
                    s.BoardId,
                    s.CreatedAt,
                    s.UpdatedAt,
                    MessageCount = s.Messages.Count()
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (session == null)
            {
                // Current session doesn't exist, clear the reference
                board.CurrentSessionId = null;
                await _context.SaveChangesAsync(cancellationToken);
                return Result.Success<GetCurrentChatSessionResponse?>(null);
            }

            var response = new GetCurrentChatSessionResponse(
                session.Id,
                session.BoardId,
                session.CreatedAt,
                session.UpdatedAt,
                session.MessageCount
            );

            _logger.LogInformation("Retrieved current chat session {SessionId} for board {BoardId}", session.Id, request.BoardId);

            return Result.Success<GetCurrentChatSessionResponse?>(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving current chat session for board {BoardId}", request.BoardId);
            return Result.Failure<GetCurrentChatSessionResponse?>("Failed to retrieve current chat session");
        }
    }
} 