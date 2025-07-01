using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Chat.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Chat.Commands;

/// <summary>
/// Command to save a chat message to the database
/// Part of the Chat feature vertical slice
/// </summary>
public record SaveChatMessage(
    string UserName,
    string Message,
    string ConnectionId,
    string MessageType = "user",
    bool IsSystemMessage = false
) : ICommand<Result<Guid>>;

/// <summary>
/// Handler for saving chat messages with proper validation and persistence
/// </summary>
public class SaveChatMessageHandler : ICommandHandler<SaveChatMessage, Result<Guid>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SaveChatMessageHandler> _logger;

    public SaveChatMessageHandler(
        ApplicationDbContext context,
        ILogger<SaveChatMessageHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(SaveChatMessage request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.UserName))
                return Result.Failure<Guid>("Username is required");

            if (string.IsNullOrWhiteSpace(request.Message))
                return Result.Failure<Guid>("Message cannot be empty");

            if (request.Message.Length > 2000)
                return Result.Failure<Guid>("Message too long (max 2000 characters)");

            // Create chat message entity
            var chatMessage = new ChatMessage
            {
                Id = Guid.NewGuid(),
                UserName = request.UserName.Trim(),
                Message = request.Message.Trim(),
                ConnectionId = request.ConnectionId,
                MessageType = request.MessageType,
                IsSystemMessage = request.IsSystemMessage,
                Timestamp = DateTime.UtcNow // Always UTC
            };

            // Save to database
            _context.ChatMessages.Add(chatMessage);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("💾 Chat message saved: {MessageId} from {UserName}", 
                chatMessage.Id, request.UserName);

            return Result.Success(chatMessage.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to save chat message from {UserName}", request.UserName);
            return Result.Failure<Guid>("Failed to save message");
        }
    }
} 