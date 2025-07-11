using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Kanban.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Kanban.Commands;

public record SaveChatMessageCommand(
    Guid SessionId, 
    string UserId, 
    string Role, 
    string Content,
    string? ToolCallId = null
) : ICommand<Result<SaveChatMessageResponse>>;

public record SaveChatMessageResponse(Guid MessageId, Guid SessionId, int Order, DateTime CreatedAt);

public class SaveChatMessageCommandHandler : ICommandHandler<SaveChatMessageCommand, Result<SaveChatMessageResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SaveChatMessageCommandHandler> _logger;

    public SaveChatMessageCommandHandler(ApplicationDbContext context, ILogger<SaveChatMessageCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<SaveChatMessageResponse>> Handle(SaveChatMessageCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Verify session exists and user has access
            var session = await _context.KanbanChatSessions
                .Include(s => s.Board)
                .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.UserId == request.UserId && s.IsActive, cancellationToken);

            if (session == null)
            {
                return Result.Failure<SaveChatMessageResponse>("Chat session not found or access denied");
            }

            // Get the next order number for this session
            var maxOrder = await _context.KanbanChatMessages
                .Where(m => m.SessionId == request.SessionId)
                .MaxAsync(m => (int?)m.Order, cancellationToken) ?? 0;

            // Create new message
            var message = new KanbanChatMessage
            {
                SessionId = request.SessionId,
                UserId = request.UserId,
                Role = request.Role,
                Content = request.Content,
                ToolCallId = request.ToolCallId,
                Order = maxOrder + 1,
                CreatedAt = DateTime.UtcNow
            };

            _context.KanbanChatMessages.Add(message);

            // Update session timestamp
            session.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Saved chat message {MessageId} to session {SessionId}", message.Id, request.SessionId);

            return Result.Success(new SaveChatMessageResponse(message.Id, message.SessionId, message.Order, message.CreatedAt));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving chat message to session {SessionId}", request.SessionId);
            return Result.Failure<SaveChatMessageResponse>("Failed to save chat message");
        }
    }
} 