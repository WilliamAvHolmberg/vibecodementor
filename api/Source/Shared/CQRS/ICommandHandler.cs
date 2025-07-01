using MediatR;

namespace Source.Shared.CQRS;

/// <summary>
/// Handler for commands that don't return a value
/// </summary>
/// <typeparam name="TCommand">The command type</typeparam>
public interface ICommandHandler<in TCommand> : IRequestHandler<TCommand>
    where TCommand : ICommand
{
}

/// <summary>
/// Handler for commands that return a result
/// </summary>
/// <typeparam name="TCommand">The command type</typeparam>
/// <typeparam name="TResult">The result type</typeparam>
public interface ICommandHandler<in TCommand, TResult> : IRequestHandler<TCommand, TResult>
    where TCommand : ICommand<TResult>
{
} 