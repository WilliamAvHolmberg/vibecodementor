using Microsoft.AspNetCore.Identity;
using Source.Infrastructure.AuthorizationModels;
using Source.Features.Users.Models;
using System.Security.Claims;

namespace Source.Infrastructure.AuthorizationExtensions;

/// <summary>
/// Extension methods for role-based authorization helpers
/// </summary>
public static class RoleAuthorizationExtensions
{
    /// <summary>
    /// Check if user has the specified role
    /// </summary>
    public static async Task<bool> HasRoleAsync(this UserManager<User> userManager, User user, ApplicationRole role)
    {
        return await userManager.IsInRoleAsync(user, role.ToRoleName());
    }

    /// <summary>
    /// Check if user has any of the specified roles
    /// </summary>
    public static async Task<bool> HasAnyRoleAsync(this UserManager<User> userManager, User user, params ApplicationRole[] roles)
    {
        foreach (var role in roles)
        {
            if (await userManager.IsInRoleAsync(user, role.ToRoleName()))
            {
                return true;
            }
        }
        return false;
    }

    /// <summary>
    /// Check if user has admin privileges
    /// </summary>
    public static async Task<bool> HasAdminPrivilegesAsync(this UserManager<User> userManager, User user)
    {
        return await userManager.HasAnyRoleAsync(user, ApplicationRole.Admin, ApplicationRole.SuperAdmin);
    }

    /// <summary>
    /// Check if user has super admin privileges
    /// </summary>
    public static async Task<bool> HasSuperAdminPrivilegesAsync(this UserManager<User> userManager, User user)
    {
        return await userManager.HasRoleAsync(user, ApplicationRole.SuperAdmin);
    }

    /// <summary>
    /// Get user's application roles
    /// </summary>
    public static async Task<List<ApplicationRole>> GetApplicationRolesAsync(this UserManager<User> userManager, User user)
    {
        var roleNames = await userManager.GetRolesAsync(user);
        var applicationRoles = new List<ApplicationRole>();

        foreach (var roleName in roleNames)
        {
            var role = ApplicationRoleExtensions.FromRoleName(roleName);
            if (role.HasValue)
            {
                applicationRoles.Add(role.Value);
            }
        }

        return applicationRoles;
    }

    /// <summary>
    /// Check if ClaimsPrincipal has the specified role
    /// </summary>
    public static bool HasRole(this ClaimsPrincipal principal, ApplicationRole role)
    {
        return principal.IsInRole(role.ToRoleName());
    }

    /// <summary>
    /// Check if ClaimsPrincipal has any of the specified roles
    /// </summary>
    public static bool HasAnyRole(this ClaimsPrincipal principal, params ApplicationRole[] roles)
    {
        return roles.Any(role => principal.IsInRole(role.ToRoleName()));
    }

    /// <summary>
    /// Check if ClaimsPrincipal has admin privileges
    /// </summary>
    public static bool HasAdminPrivileges(this ClaimsPrincipal principal)
    {
        return principal.HasAnyRole(ApplicationRole.Admin, ApplicationRole.SuperAdmin);
    }

    /// <summary>
    /// Check if ClaimsPrincipal has super admin privileges
    /// </summary>
    public static bool HasSuperAdminPrivileges(this ClaimsPrincipal principal)
    {
        return principal.HasRole(ApplicationRole.SuperAdmin);
    }
}
