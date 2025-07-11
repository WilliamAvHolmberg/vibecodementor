using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Kanban.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Kanban.Commands;

public record CreateChatSessionCommand(Guid BoardId, string UserId) : ICommand<Result<CreateChatSessionResponse>>;

public record CreateChatSessionResponse(Guid SessionId, Guid BoardId, DateTime CreatedAt);

public class CreateChatSessionCommandHandler : ICommandHandler<CreateChatSessionCommand, Result<CreateChatSessionResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CreateChatSessionCommandHandler> _logger;

    public CreateChatSessionCommandHandler(ApplicationDbContext context, ILogger<CreateChatSessionCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<CreateChatSessionResponse>> Handle(CreateChatSessionCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Verify board exists and user has access
            var board = await _context.KanbanBoards
                .FirstOrDefaultAsync(b => b.Id == request.BoardId && b.UserId == request.UserId && b.IsActive, cancellationToken);

            if (board == null)
            {
                return Result.Failure<CreateChatSessionResponse>("Board not found or access denied");
            }

            // Create new chat session
            var session = new KanbanChatSession
            {
                BoardId = request.BoardId,
                UserId = request.UserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.KanbanChatSessions.Add(session);

            // Update board's current session
            board.CurrentSessionId = session.Id;
            board.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Created new chat session {SessionId} for board {BoardId}", session.Id, request.BoardId);

            return Result.Success(new CreateChatSessionResponse(session.Id, session.BoardId, session.CreatedAt));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating chat session for board {BoardId}", request.BoardId);
            return Result.Failure<CreateChatSessionResponse>("Failed to create chat session");
        }
    }
} 