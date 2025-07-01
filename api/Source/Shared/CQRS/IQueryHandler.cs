using MediatR;

namespace Source.Shared.CQRS;

/// <summary>
/// Handler for queries that return a result
/// Queries should be read-only operations
/// </summary>
/// <typeparam name="TQuery">The query type</typeparam>
/// <typeparam name="TResult">The result type</typeparam>
public interface IQueryHandler<in TQuery, TResult> : IRequestHandler<TQuery, TResult>
    where TQuery : IQuery<TResult>
{
} 