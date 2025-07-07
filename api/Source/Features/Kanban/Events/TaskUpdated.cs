using Source.Shared.Events;

namespace Source.Features.Kanban.Events;

/// <summary>
/// Domain event raised when a kanban task is updated
/// </summary>
public record TaskUpdated(
    Guid BoardId,
    Guid TaskId,
    string Title,
    string UpdateType, // "subtask_added", "subtask_toggled", "task_modified"
    string UserId,
    DateTime OccurredAt
) : IDomainEvent; 