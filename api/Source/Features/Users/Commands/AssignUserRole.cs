using Microsoft.AspNetCore.Identity;
using Source.Features.Users.Models;
using Source.Infrastructure.AuthorizationModels;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Users.Commands;

/// <summary>
/// Command to assign a role to a user
/// </summary>
public record AssignUserRoleCommand(string UserId, ApplicationRole Role) : ICommand<Result>;

/// <summary>
/// Handler for assigning roles to users
/// </summary>
public class AssignUserRoleHandler : ICommandHandler<AssignUserRoleCommand, Result>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<AssignUserRoleHandler> _logger;

    public AssignUserRoleHandler(UserManager<User> userManager, ILogger<AssignUserRoleHandler> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Result> Handle(AssignUserRoleCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Attempting to assign role {Role} to user {UserId}", request.Role, request.UserId);

        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
        {
            _logger.LogWarning("User not found: {UserId}", request.UserId);
            return Result.Failure("User not found");
        }

        var roleName = request.Role.ToRoleName();
        
        // Check if user already has this role
        if (await _userManager.IsInRoleAsync(user, roleName))
        {
            _logger.LogInformation("User {UserId} already has role {Role}", request.UserId, request.Role);
            return Result.Success();
        }

        var result = await _userManager.AddToRoleAsync(user, roleName);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            _logger.LogError("Failed to assign role {Role} to user {UserId}: {Errors}", request.Role, request.UserId, errors);
            return Result.Failure($"Failed to assign role: {errors}");
        }

        _logger.LogInformation("✅ Successfully assigned role {Role} to user {Email} ({UserId})", request.Role, user.Email, request.UserId);
        return Result.Success();
    }
}
