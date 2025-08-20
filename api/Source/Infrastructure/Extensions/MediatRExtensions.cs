using MediatR;
using Source.Shared.Behaviors;
using System.Reflection;

namespace Source.Infrastructure.Extensions;

public static class MediatRExtensions
{
    public static IServiceCollection AddMediatRServices(this IServiceCollection services)
    {
        // Register MediatR with all handlers from the current assembly
        services.AddMediatR(cfg => 
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            
            // Add pipeline behaviors
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(TracingBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        });

        return services;
    }
} 