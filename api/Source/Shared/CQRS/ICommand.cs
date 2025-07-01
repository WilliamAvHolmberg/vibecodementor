using MediatR;

namespace Source.Shared.CQRS;

/// <summary>
/// Marker interface for commands that don't return a value
/// </summary>
public interface ICommand : IRequest
{
}

/// <summary>
/// Interface for commands that return a result
/// </summary>
/// <typeparam name="TResult">The type of result returned</typeparam>
public interface ICommand<out TResult> : IRequest<TResult>
{
} 