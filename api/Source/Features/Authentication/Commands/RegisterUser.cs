using MediatR;
using Microsoft.AspNetCore.Identity;
using Source.Features.Users.Events;
using Source.Features.Users.Models;
using Source.Infrastructure.AuthorizationModels;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Authentication.Commands;

/// <summary>
/// Command to register a new user
/// </summary>
public record RegisterUserCommand(string Email, string Password) : ICommand<Result<RegisterUserResponse>>;

/// <summary>
/// Response for user registration
/// </summary>
public record RegisterUserResponse(string UserId, string Email);

/// <summary>
/// Handler for user registration
/// </summary>
public class RegisterUserHandler : ICommandHandler<RegisterUserCommand, Result<RegisterUserResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly IMediator _mediator;
    private readonly ILogger<RegisterUserHandler> _logger;

    public RegisterUserHandler(UserManager<User> userManager, IMediator mediator, ILogger<RegisterUserHandler> logger)
    {
        _userManager = userManager;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<RegisterUserResponse>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Attempting to register user with email: {Email}", request.Email);

        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Result.Failure<RegisterUserResponse>("User with this email already exists");
        }

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true // For simplicity in development
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            _logger.LogWarning("Failed to register user {Email}: {Errors}", request.Email, errors);
            return Result.Failure<RegisterUserResponse>($"Registration failed: {errors}");
        }

        // Assign default "User" role to new registrations
        await _userManager.AddToRoleAsync(user, RoleConstants.User);
        
        _logger.LogInformation("Successfully registered user {Email} with ID {UserId} and assigned User role", request.Email, user.Id);
        
        // 🚀 PUBLISH UserCreated EVENT - This triggers the welcome email!
        var userCreatedEvent = new UserCreated(user.Id, user.Email!, DateTime.UtcNow);
        await _mediator.Publish(userCreatedEvent, cancellationToken);
        
        var response = new RegisterUserResponse(user.Id, user.Email!);
        return Result.Success(response);
    }
} 