using Microsoft.AspNetCore.Identity;
using Source.Features.Users.Models;

namespace Source.Infrastructure.Extensions;

public static class SeedDataExtensions
{
    public static async Task<WebApplication> SeedDevelopmentData(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        
        // Create development admin user
        const string adminEmail = "admin@api.dev";
        const string adminPassword = "Admin123!";
        
        var existingUser = await userManager.FindByEmailAsync(adminEmail);
        if (existingUser == null)
        {
            var adminUser = new User
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                FirstName = "Admin",
                LastName = "User"
            };
            
            var result = await userManager.CreateAsync(adminUser, adminPassword);
            if (result.Succeeded)
            {
                app.Logger.LogInformation("Development admin user created: {Email}", adminEmail);
            }
        }
        
        return app;
    }
} 