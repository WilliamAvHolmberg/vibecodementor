using Microsoft.AspNetCore.Identity;
using Source.Features.Users.Models;
using Source.Infrastructure.AuthorizationModels;
using Source.Infrastructure.AuthorizationExtensions;
using Source.Shared.CQRS;
using Source.Shared.Results;
using System.Security.Claims;

namespace Source.Features.Users.Commands;

public record UpdateUserCommand(string UserId, string? FirstName, string? LastName, string? Email, List<string>? Roles, ClaimsPrincipal? CurrentUser) : ICommand<Result<UpdateUserResponse>>;

public record UpdateUserResponse(string UserId, string Email, string FullName, DateTime UpdatedAt, List<string>? UpdatedRoles);

public class UpdateUserHandler : ICommandHandler<UpdateUserCommand, Result<UpdateUserResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<UpdateUserHandler> _logger;

    public UpdateUserHandler(UserManager<User> userManager, ILogger<UpdateUserHandler> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Result<UpdateUserResponse>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
        {
            return Result.Failure<UpdateUserResponse>("User not found");
        }

        if (user.IsDeleted)
        {
            return Result.Failure<UpdateUserResponse>("Cannot update deleted user");
        }

        // Update properties
        if (!string.IsNullOrWhiteSpace(request.FirstName))
            user.FirstName = request.FirstName;
        
        if (!string.IsNullOrWhiteSpace(request.LastName))
            user.LastName = request.LastName;

        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
        {
            var emailExists = await _userManager.FindByEmailAsync(request.Email);
            if (emailExists != null && emailExists.Id != user.Id)
            {
                return Result.Failure<UpdateUserResponse>("Email already in use");
            }
            
            user.Email = request.Email;
            user.UserName = request.Email;
        }

        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Result.Failure<UpdateUserResponse>($"Update failed: {errors}");
        }

        // Handle role updates if provided and user has SuperAdmin privileges
        List<string>? updatedRoles = null;
        if (request.Roles != null && request.CurrentUser != null)
        {
            if (!request.CurrentUser.HasSuperAdminPrivileges())
            {
                _logger.LogWarning("User {UserId} attempted to update roles without SuperAdmin privileges", request.CurrentUser.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return Result.Failure<UpdateUserResponse>("Insufficient privileges to update user roles");
            }

            // Validate all roles exist
            var validRoles = RoleConstants.AllRoles;
            var invalidRoles = request.Roles.Where(r => !validRoles.Contains(r)).ToList();
            if (invalidRoles.Any())
            {
                return Result.Failure<UpdateUserResponse>($"Invalid roles: {string.Join(", ", invalidRoles)}");
            }

            // Get current roles and update
            var currentRoles = await _userManager.GetRolesAsync(user);
            
            // Remove all current roles
            if (currentRoles.Any())
            {
                var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
                if (!removeResult.Succeeded)
                {
                    var errors = string.Join(", ", removeResult.Errors.Select(e => e.Description));
                    return Result.Failure<UpdateUserResponse>($"Failed to remove existing roles: {errors}");
                }
            }

            // Add new roles
            if (request.Roles.Any())
            {
                var addResult = await _userManager.AddToRolesAsync(user, request.Roles);
                if (!addResult.Succeeded)
                {
                    var errors = string.Join(", ", addResult.Errors.Select(e => e.Description));
                    return Result.Failure<UpdateUserResponse>($"Failed to assign new roles: {errors}");
                }
            }

            updatedRoles = request.Roles;
            _logger.LogInformation("Updated roles for user {UserId}: {Roles}", user.Id, string.Join(", ", request.Roles));
        }

        _logger.LogInformation("Successfully updated user {UserId}", user.Id);

        var response = new UpdateUserResponse(user.Id, user.Email!, user.FullName, user.UpdatedAt, updatedRoles);
        return Result.Success(response);
    }
} 