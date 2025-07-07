using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Source.Features.Authentication.Services;
using System.Text;

namespace Source.Infrastructure.Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddAuthenticationServices(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtKey = configuration["Jwt:Key"] ?? "your-secret-key-here-minimum-32-characters-long";
        var jwtIssuer = configuration["Jwt:Issuer"] ?? "api";
        var jwtAudience = configuration["Jwt:Audience"] ?? "api";

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false; // Only for development
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ClockSkew = TimeSpan.Zero,
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            };

            // Configure to read JWT tokens from cookies
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    // First check the Authorization header (default behavior)
                    var token = context.Request.Headers.Authorization
                        .FirstOrDefault()?.Split(" ").Last();

                    // If no Authorization header token, check cookies
                    if (string.IsNullOrEmpty(token))
                    {
                        token = context.Request.Cookies["auth-token"];
                    }

                    if (!string.IsNullOrEmpty(token))
                    {
                        context.Token = token;
                    }

                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorization();

        // Register JWT token service
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        return services;
    }
} 