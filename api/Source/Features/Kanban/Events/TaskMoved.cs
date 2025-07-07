using Source.Shared.Events;

namespace Source.Features.Kanban.Events;

/// <summary>
/// Domain event raised when a kanban task is moved between columns
/// </summary>
public record TaskMoved(
    Guid BoardId,
    Guid TaskId,
    string Title,
    string FromColumn,
    string ToColumn,
    string UserId,
    DateTime OccurredAt
) : IDomainEvent; 