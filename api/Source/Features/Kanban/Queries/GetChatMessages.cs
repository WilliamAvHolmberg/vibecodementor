using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Kanban.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Kanban.Queries;

public record GetChatMessagesQuery(Guid SessionId, string UserId) : IQuery<Result<GetChatMessagesResponse>>;

public record GetChatMessagesResponse(
    Guid SessionId, 
    Guid BoardId, 
    List<ChatMessageDto> Messages
);

public record ChatMessageDto(
    Guid Id,
    string Role,
    string Content,
    string? ToolCallId,
    int Order,
    DateTime CreatedAt
);

public class GetChatMessagesQueryHandler : IQueryHandler<GetChatMessagesQuery, Result<GetChatMessagesResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<GetChatMessagesQueryHandler> _logger;

    public GetChatMessagesQueryHandler(ApplicationDbContext context, ILogger<GetChatMessagesQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<GetChatMessagesResponse>> Handle(GetChatMessagesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // Verify session exists and user has access
            var session = await _context.KanbanChatSessions
                .Include(s => s.Board)
                .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.UserId == request.UserId && s.IsActive, cancellationToken);

            if (session == null)
            {
                return Result.Failure<GetChatMessagesResponse>("Chat session not found or access denied");
            }

            // Get all messages for this session, ordered by sequence
            var messages = await _context.KanbanChatMessages
                .Where(m => m.SessionId == request.SessionId)
                .OrderBy(m => m.Order)
                .Select(m => new ChatMessageDto(
                    m.Id,
                    m.Role,
                    m.Content,
                    m.ToolCallId,
                    m.Order,
                    m.CreatedAt
                ))
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {MessageCount} messages for session {SessionId}", messages.Count, request.SessionId);

            return Result.Success(new GetChatMessagesResponse(session.Id, session.BoardId, messages));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving chat messages for session {SessionId}", request.SessionId);
            return Result.Failure<GetChatMessagesResponse>("Failed to retrieve chat messages");
        }
    }
} 