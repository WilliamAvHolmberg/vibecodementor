using Microsoft.AspNetCore.Identity;
using Source.Infrastructure.AuthorizationModels;

namespace Source.Infrastructure.AuthorizationServices;

/// <summary>
/// Service responsible for seeding roles and default admin users
/// </summary>
public class RoleSeederService
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ILogger<RoleSeederService> _logger;

    public RoleSeederService(RoleManager<IdentityRole> roleManager, ILogger<RoleSeederService> logger)
    {
        _roleManager = roleManager;
        _logger = logger;
    }

    /// <summary>
    /// Seeds all application roles if they don't exist
    /// </summary>
    public async Task SeedRolesAsync()
    {
        _logger.LogInformation("🛡️ Starting role seeding...");

        foreach (var role in ApplicationRoleExtensions.GetAllRoles())
        {
            var roleName = role.ToRoleName();
            
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                var identityRole = new IdentityRole(roleName);
                var result = await _roleManager.CreateAsync(identityRole);
                
                if (result.Succeeded)
                {
                    _logger.LogInformation("✅ Created role: {RoleName}", roleName);
                }
                else
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    _logger.LogError("❌ Failed to create role {RoleName}: {Errors}", roleName, errors);
                }
            }
            else
            {
                _logger.LogDebug("Role already exists: {RoleName}", roleName);
            }
        }

        _logger.LogInformation("🛡️ Role seeding completed");
    }
}
