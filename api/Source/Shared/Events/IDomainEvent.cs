using MediatR;

namespace Source.Shared.Events;

/// <summary>
/// Marker interface for domain events
/// Domain events represent something that happened in the business domain
/// They should be named in past tense (e.g., UserCreated, OrderCompleted)
/// </summary>
public interface IDomainEvent : INotification
{
    /// <summary>
    /// When the event occurred
    /// </summary>
    DateTime OccurredAt { get; }
} 