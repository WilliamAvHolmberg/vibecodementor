using System.Diagnostics;
using MediatR;

namespace Source.Shared.Behaviors;

/// <summary>
/// MediatR pipeline behavior that creates OpenTelemetry traces for all requests
/// Automatically creates spans with proper naming and error handling
/// </summary>
/// <typeparam name="TRequest">The request type</typeparam>
/// <typeparam name="TResponse">The response type</typeparam>
public class TracingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ActivitySource _activitySource;

    public TracingBehavior(ActivitySource activitySource)
    {
        _activitySource = activitySource;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        using var activity = _activitySource.StartActivity($"MediatR.{requestName}");

        if (activity != null)
        {
            activity.SetTag("operation.name", requestName);
            activity.SetTag("component", "MediatR");
            activity.SetTag("request.type", typeof(TRequest).FullName);
            activity.SetTag("response.type", typeof(TResponse).FullName);
        }

        try
        {
            var response = await next();
            
            activity?.SetStatus(ActivityStatusCode.Ok);
            return response;
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            activity?.SetTag("error", true);
            activity?.SetTag("error.type", ex.GetType().Name);
            activity?.SetTag("error.message", ex.Message);
            throw;
        }
    }
}