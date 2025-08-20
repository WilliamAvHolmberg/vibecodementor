using Source.Infrastructure.AuthorizationServices;

namespace Source.Infrastructure.Extensions;

public static class SeedDataExtensions
{
    public static async Task<WebApplication> SeedDevelopmentData(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var roleSeeder = scope.ServiceProvider.GetRequiredService<RoleSeederService>();
        
        // Seed all roles (User, Admin, SuperAdmin)
        await roleSeeder.SeedRolesAsync();
        
        app.Logger.LogInformation("🛡️ Development data seeding completed - roles are ready");
        app.Logger.LogInformation("💡 Use POST /api/auth/create-super-admin to create your first SuperAdmin");
        
        return app;
    }
} 