using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Chat.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Chat.Queries;

/// <summary>
/// Query to get recent chat messages with pagination
/// Part of the Chat feature vertical slice
/// </summary>
public record GetRecentMessages(
    int Take = 20,
    DateTime? Before = null
) : IQuery<Result<List<ChatMessageDto>>>;

/// <summary>
/// DTO for chat message responses
/// </summary>
public record ChatMessageDto(
    Guid Id,
    string UserName,
    string Message,
    DateTime Timestamp,
    string ConnectionId,
    string MessageType,
    bool IsSystemMessage
);

/// <summary>
/// Handler for retrieving recent chat messages with proper pagination
/// </summary>
public class GetRecentMessagesHandler : IQueryHandler<GetRecentMessages, Result<List<ChatMessageDto>>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<GetRecentMessagesHandler> _logger;

    public GetRecentMessagesHandler(
        ApplicationDbContext context,
        ILogger<GetRecentMessagesHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<List<ChatMessageDto>>> Handle(GetRecentMessages request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate pagination parameters
            if (request.Take <= 0 || request.Take > 100)
                return Result.Failure<List<ChatMessageDto>>("Take must be between 1 and 100");

            var query = _context.ChatMessages.AsQueryable();

            // Filter by timestamp if specified (for pagination)
            if (request.Before.HasValue)
            {
                query = query.Where(m => m.Timestamp < request.Before.Value);
            }

            // Get recent messages ordered by timestamp (most recent first for pagination)
            var messages = await query
                .OrderByDescending(m => m.Timestamp)
                .Take(request.Take)
                .Select(m => new ChatMessageDto(
                    m.Id,
                    m.UserName,
                    m.Message,
                    m.Timestamp, // UTC timestamp
                    m.ConnectionId,
                    m.MessageType,
                    m.IsSystemMessage
                ))
                .ToListAsync(cancellationToken);

            // Reverse to show oldest first (normal chat order)
            messages.Reverse();

            _logger.LogInformation("📖 Retrieved {Count} recent chat messages", messages.Count);

            return Result.Success(messages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to retrieve recent chat messages");
            return Result.Failure<List<ChatMessageDto>>("Failed to retrieve messages");
        }
    }
} 