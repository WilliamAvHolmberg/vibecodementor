using Microsoft.AspNetCore.Identity;
using Source.Infrastructure;
using Source.Features.Users.Models;
using Source.Infrastructure.AuthorizationServices;

namespace Source.Infrastructure.Extensions;

public static class IdentityExtensions
{
    public static IServiceCollection AddIdentityServices(this IServiceCollection services)
    {
        services.AddIdentity<User, IdentityRole>(options =>
        {
            // Password settings
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 6;
            
            // User settings
            options.User.RequireUniqueEmail = true;
            
            // Sign-in settings
            options.SignIn.RequireConfirmedEmail = false;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        // Register role seeder service
        services.AddScoped<RoleSeederService>();

        return services;
    }
} 