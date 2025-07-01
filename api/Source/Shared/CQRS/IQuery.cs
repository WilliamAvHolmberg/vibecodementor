using MediatR;

namespace Source.Shared.CQRS;

/// <summary>
/// Interface for queries that return a result
/// Queries should be read-only operations
/// </summary>
/// <typeparam name="TResult">The type of result returned</typeparam>
public interface IQuery<out TResult> : IRequest<TResult>
{
} 