namespace Source.Infrastructure.AuthorizationModels;

/// <summary>
/// String constants for role names
/// Use these in [Authorize] attributes and role checks
/// </summary>
public static class RoleConstants
{
    public const string User = nameof(ApplicationRole.User);
    public const string Admin = nameof(ApplicationRole.Admin);
    public const string SuperAdmin = nameof(ApplicationRole.SuperAdmin);

    /// <summary>
    /// All available role names
    /// </summary>
    public static readonly string[] AllRoles = [User, Admin, SuperAdmin];

    /// <summary>
    /// Admin-level roles (Admin + SuperAdmin)
    /// </summary>
    public static readonly string[] AdminRoles = [Admin, SuperAdmin];

    /// <summary>
    /// Super admin only
    /// </summary>
    public static readonly string[] SuperAdminRoles = [SuperAdmin];
}
