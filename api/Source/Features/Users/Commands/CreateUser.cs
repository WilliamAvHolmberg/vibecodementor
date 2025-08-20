using Microsoft.AspNetCore.Identity;
using Source.Features.Users.Models;
using Source.Infrastructure.AuthorizationModels;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Users.Commands;

public record CreateUserCommand(string Email, string? FirstName = null, string? LastName = null, List<string>? Roles = null) : ICommand<Result<CreateUserResponse>>;

public record CreateUserResponse(string UserId, string Email, string FullName);

public class CreateUserCommandHandler : ICommandHandler<CreateUserCommand, Result<CreateUserResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<CreateUserCommandHandler> _logger;

    public CreateUserCommandHandler(UserManager<User> userManager, ILogger<CreateUserCommandHandler> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Result<CreateUserResponse>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Result.Failure<CreateUserResponse>("User with this email already exists");
        }

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true,
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        var result = await _userManager.CreateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Result.Failure<CreateUserResponse>($"User creation failed: {errors}");
        }

        // Assign roles if provided, default to "User"
        var rolesToAssign = request.Roles?.Any() == true ? request.Roles : new List<string> { RoleConstants.User };
        
        if (rolesToAssign.Any())
        {
            var roleResult = await _userManager.AddToRolesAsync(user, rolesToAssign);
            if (!roleResult.Succeeded)
            {
                var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
                _logger.LogError("Failed to assign roles to user {Email}: {Errors}", request.Email, errors);
                // Don't fail the creation, just log the error
            }
            else
            {
                _logger.LogInformation("Assigned roles {Roles} to user {Email}", string.Join(", ", rolesToAssign), request.Email);
            }
        }

        _logger.LogInformation("Successfully created user {Email} with ID {UserId}", request.Email, user.Id);

        var response = new CreateUserResponse(user.Id, user.Email!, user.FullName);
        return Result.Success(response);
    }
} 