using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Kanban.Events;
using Source.Features.Kanban.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Kanban.Commands;

/// <summary>
/// Command to create a new kanban board with default columns
/// Part of the Kanban feature vertical slice
/// </summary>
public record CreateBoard(
    string UserId,
    string Title,
    string Description = ""
) : ICommand<Result<CreateBoardResponse>>;

/// <summary>
/// Response DTO for board creation
/// </summary>
public record CreateBoardResponse(
    Guid BoardId,
    string Title,
    DateTime CreatedAt
);

/// <summary>
/// Handler for creating kanban boards with default columns
/// </summary>
public class CreateBoardHandler : ICommandHandler<CreateBoard, Result<CreateBoardResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly IMediator _mediator;
    private readonly ILogger<CreateBoardHandler> _logger;

    public CreateBoardHandler(
        ApplicationDbContext context,
        IMediator mediator,
        ILogger<CreateBoardHandler> logger)
    {
        _context = context;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<CreateBoardResponse>> Handle(CreateBoard request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.UserId))
                return Result.Failure<CreateBoardResponse>("User ID is required");

            if (string.IsNullOrWhiteSpace(request.Title))
                return Result.Failure<CreateBoardResponse>("Board title is required");

            if (request.Title.Length > 200)
                return Result.Failure<CreateBoardResponse>("Board title too long (max 200 characters)");

            // Check if user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId, cancellationToken);
            if (!userExists)
                return Result.Failure<CreateBoardResponse>("User not found");

            // Create board
            var board = new KanbanBoard
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.KanbanBoards.Add(board);

            // Create default columns
            var columns = new List<KanbanColumn>
            {
                new KanbanColumn
                {
                    Id = Guid.NewGuid(),
                    BoardId = board.Id,
                    Name = "TODO",
                    Order = 1,
                    IsCompleted = false,
                    CreatedAt = DateTime.UtcNow
                },
                new KanbanColumn
                {
                    Id = Guid.NewGuid(),
                    BoardId = board.Id,
                    Name = "IN_PROGRESS",
                    Order = 2,
                    IsCompleted = false,
                    CreatedAt = DateTime.UtcNow
                },
                new KanbanColumn
                {
                    Id = Guid.NewGuid(),
                    BoardId = board.Id,
                    Name = "DONE",
                    Order = 3,
                    IsCompleted = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            _context.KanbanColumns.AddRange(columns);

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("🎯 Kanban board created: {BoardId} for user {UserId}", 
                board.Id, request.UserId);

            // Publish domain event for SignalR broadcasting
            await _mediator.Publish(new BoardCreated(
                board.Id,
                board.Title,
                request.UserId,
                DateTime.UtcNow
            ), cancellationToken);

            return Result.Success(new CreateBoardResponse(board.Id, board.Title, board.CreatedAt));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to create kanban board for user {UserId}", request.UserId);
            return Result.Failure<CreateBoardResponse>("Failed to create board");
        }
    }
} 