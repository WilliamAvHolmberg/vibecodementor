using MediatR;

namespace Source.Shared.Events;

/// <summary>
/// Handler for domain events
/// Multiple handlers can react to the same event
/// Handlers should be named descriptively (e.g., SendWelcomeEmailOnUserCreated)
/// </summary>
/// <typeparam name="TEvent">The domain event type</typeparam>
public interface IEventHandler<in TEvent> : INotificationHandler<TEvent>
    where TEvent : IDomainEvent
{
} 