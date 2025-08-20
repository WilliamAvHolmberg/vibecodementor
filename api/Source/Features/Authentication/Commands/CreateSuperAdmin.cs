using MediatR;
using Microsoft.AspNetCore.Identity;
using Source.Features.Users.Models;
using Source.Features.Users.Events;
using Source.Infrastructure.AuthorizationModels;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Authentication.Commands;

/// <summary>
/// Command to create the first SuperAdmin user (one-time setup)
/// </summary>
public record CreateSuperAdminCommand(string Email, string? FirstName, string? LastName) : ICommand<Result<CreateSuperAdminResponse>>;

/// <summary>
/// Response for SuperAdmin creation
/// </summary>
public record CreateSuperAdminResponse(string UserId, string Email, string Message);

/// <summary>
/// Handler for creating the first SuperAdmin user
/// Only works if no SuperAdmin exists in the system
/// </summary>
public class CreateSuperAdminHandler : ICommandHandler<CreateSuperAdminCommand, Result<CreateSuperAdminResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IMediator _mediator;
    private readonly ILogger<CreateSuperAdminHandler> _logger;

    public CreateSuperAdminHandler(
        UserManager<User> userManager,
        RoleManager<IdentityRole> roleManager,
        IMediator mediator,
        ILogger<CreateSuperAdminHandler> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<CreateSuperAdminResponse>> Handle(CreateSuperAdminCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("🔐 Attempting to create SuperAdmin with email: {Email}", request.Email);

        // Check if SuperAdmin role exists
        var superAdminRoleName = RoleConstants.SuperAdmin;
        if (!await _roleManager.RoleExistsAsync(superAdminRoleName))
        {
            _logger.LogError("❌ SuperAdmin role does not exist. Roles may not be seeded properly.");
            return Result.Failure<CreateSuperAdminResponse>("System not properly initialized. SuperAdmin role missing.");
        }

        // Check if any SuperAdmin already exists
        var existingSuperAdmins = await _userManager.GetUsersInRoleAsync(superAdminRoleName);
        if (existingSuperAdmins.Any())
        {
            _logger.LogWarning("🚫 SuperAdmin creation blocked - SuperAdmin already exists: {ExistingEmails}", 
                string.Join(", ", existingSuperAdmins.Select(u => u.Email)));
            return Result.Failure<CreateSuperAdminResponse>("SuperAdmin already exists in the system");
        }

        // Check if user with this email already exists
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            _logger.LogWarning("🚫 User with email {Email} already exists", request.Email);
            return Result.Failure<CreateSuperAdminResponse>("User with this email already exists");
        }

        // Create the SuperAdmin user
        var superAdminUser = new User
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true, // SuperAdmin should be immediately usable
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        // Create user without password (OTP-only authentication)
        var createResult = await _userManager.CreateAsync(superAdminUser);
        if (!createResult.Succeeded)
        {
            var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
            _logger.LogError("❌ Failed to create SuperAdmin user {Email}: {Errors}", request.Email, errors);
            return Result.Failure<CreateSuperAdminResponse>($"Failed to create user: {errors}");
        }

        // Assign SuperAdmin role
        var roleResult = await _userManager.AddToRoleAsync(superAdminUser, superAdminRoleName);
        if (!roleResult.Succeeded)
        {
            var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
            _logger.LogError("❌ Failed to assign SuperAdmin role to {Email}: {Errors}", request.Email, errors);
            
            // Clean up - delete the user if role assignment failed
            await _userManager.DeleteAsync(superAdminUser);
            return Result.Failure<CreateSuperAdminResponse>($"Failed to assign SuperAdmin role: {errors}");
        }

        _logger.LogInformation("✅ Successfully created SuperAdmin user {Email} with ID {UserId}", 
            request.Email, superAdminUser.Id);

        // Publish UserCreated event
        var userCreatedEvent = new UserCreated(superAdminUser.Id, superAdminUser.Email!, DateTime.UtcNow);
        await _mediator.Publish(userCreatedEvent, cancellationToken);

        var response = new CreateSuperAdminResponse(
            superAdminUser.Id, 
            superAdminUser.Email!, 
            "SuperAdmin created successfully. You can now log in using OTP authentication."
        );

        return Result.Success(response);
    }
}
