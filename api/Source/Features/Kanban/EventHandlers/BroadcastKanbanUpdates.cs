using Microsoft.AspNetCore.SignalR;
using Source.Features.Kanban.Events;
using Source.Features.Kanban.Hubs;
using Source.Shared.Events;

namespace Source.Features.Kanban.EventHandlers;

/// <summary>
/// Centralized event handler for broadcasting kanban updates via SignalR
/// Follows Domain-Driven Design + Event-Driven Architecture + Real-time notifications
/// </summary>
public class BroadcastKanbanUpdatesHandler : 
    IEventHandler<BoardCreated>,
    IEventHandler<TaskCreated>,
    IEventHandler<TaskMoved>,
    IEventHandler<TaskUpdated>
{
    private readonly IHubContext<KanbanHub> _hubContext;
    private readonly ILogger<BroadcastKanbanUpdatesHandler> _logger;

    public BroadcastKanbanUpdatesHandler(
        IHubContext<KanbanHub> hubContext,
        ILogger<BroadcastKanbanUpdatesHandler> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task Handle(BoardCreated notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("🎯 Broadcasting board created: {BoardId} by user {UserId}", 
            notification.BoardId, notification.UserId);

        var eventData = new
        {
            Type = "BoardCreated",
            BoardId = notification.BoardId.ToString(),
            Title = notification.Title,
            UserId = notification.UserId,
            Timestamp = notification.OccurredAt
        };

        // Broadcast to the user (they might have multiple sessions)
        await _hubContext.Clients.User(notification.UserId)
            .SendAsync("KanbanUpdate", eventData, cancellationToken);
    }

    public async Task Handle(TaskCreated notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("📝 Broadcasting task created: {TaskId} in board {BoardId}", 
            notification.TaskId, notification.BoardId);

        var eventData = new
        {
            Type = "TaskCreated",
            BoardId = notification.BoardId.ToString(),
            TaskId = notification.TaskId.ToString(),
            Title = notification.Title,
            ColumnName = notification.ColumnName,
            UserId = notification.UserId,
            Timestamp = notification.OccurredAt
        };

        // Broadcast to all users watching this board
        await _hubContext.Clients.Group($"Board_{notification.BoardId}")
            .SendAsync("KanbanUpdate", eventData, cancellationToken);
    }

    public async Task Handle(TaskMoved notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("🔄 Broadcasting task moved: {TaskId} from {FromColumn} to {ToColumn}", 
            notification.TaskId, notification.FromColumn, notification.ToColumn);

        var eventData = new
        {
            Type = "TaskMoved", 
            BoardId = notification.BoardId.ToString(),
            TaskId = notification.TaskId.ToString(),
            Title = notification.Title,
            FromColumn = notification.FromColumn,
            ToColumn = notification.ToColumn,
            UserId = notification.UserId,
            Timestamp = notification.OccurredAt
        };

        // Broadcast to all users watching this board
        await _hubContext.Clients.Group($"Board_{notification.BoardId}")
            .SendAsync("KanbanUpdate", eventData, cancellationToken);
    }

    public async Task Handle(TaskUpdated notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("✏️ Broadcasting task updated: {TaskId} - {UpdateType}", 
            notification.TaskId, notification.UpdateType);

        var eventData = new
        {
            Type = "TaskUpdated",
            BoardId = notification.BoardId.ToString(),
            TaskId = notification.TaskId.ToString(),
            Title = notification.Title,
            UpdateType = notification.UpdateType,
            UserId = notification.UserId,
            Timestamp = notification.OccurredAt
        };

        // Broadcast to all users watching this board
        await _hubContext.Clients.Group($"Board_{notification.BoardId}")
            .SendAsync("KanbanUpdate", eventData, cancellationToken);
    }
} 