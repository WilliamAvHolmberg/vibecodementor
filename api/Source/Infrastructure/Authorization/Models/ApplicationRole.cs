namespace Source.Infrastructure.AuthorizationModels;

/// <summary>
/// Typed enumeration for application roles
/// Provides compile-time safety for role management
/// </summary>
public enum ApplicationRole
{
    User,
    Admin,
    SuperAdmin
}

/// <summary>
/// Extension methods for ApplicationRole enum
/// </summary>
public static class ApplicationRoleExtensions
{
    /// <summary>
    /// Convert enum to string representation used by ASP.NET Core Identity
    /// </summary>
    public static string ToRoleName(this ApplicationRole role)
    {
        return role.ToString();
    }

    /// <summary>
    /// Parse string role name to enum
    /// </summary>
    public static ApplicationRole? FromRoleName(string roleName)
    {
        return Enum.TryParse<ApplicationRole>(roleName, true, out var role) ? role : null;
    }

    /// <summary>
    /// Get all available roles
    /// </summary>
    public static IEnumerable<ApplicationRole> GetAllRoles()
    {
        return Enum.GetValues<ApplicationRole>();
    }

    /// <summary>
    /// Check if role has admin privileges
    /// </summary>
    public static bool HasAdminPrivileges(this ApplicationRole role)
    {
        return role is ApplicationRole.Admin or ApplicationRole.SuperAdmin;
    }

    /// <summary>
    /// Check if role has super admin privileges
    /// </summary>
    public static bool HasSuperAdminPrivileges(this ApplicationRole role)
    {
        return role is ApplicationRole.SuperAdmin;
    }
}
