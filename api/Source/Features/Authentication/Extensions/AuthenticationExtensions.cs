using Source.Features.Authentication.Services;

namespace Source.Features.Authentication.Extensions;

/// <summary>
/// Feature-specific dependency injection extensions for Authentication
/// Makes the entire Authentication feature self-contained and portable
/// </summary>
public static class AuthenticationExtensions
{
    /// <summary>
    /// Add Authentication feature services to the DI container
    /// Call this from Program.cs: builder.Services.AddAuthenticationFeature(builder.Configuration);
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <param name="configuration">Application configuration</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddAuthenticationFeature(this IServiceCollection services, IConfiguration configuration)
    {
        // Authentication-specific services
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        // Future authentication services can be added here:
        // services.AddScoped<IPasswordHashingService, PasswordHashingService>();
        // services.AddScoped<IAuthAuditService, AuthAuditService>();
        // services.AddScoped<IRefreshTokenService, RefreshTokenService>();

        return services;
    }

    /// <summary>
    /// Add Authentication feature with additional configuration options
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <param name="configuration">Application configuration</param>
    /// <param name="configureOptions">Additional configuration options</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddAuthenticationFeature(
        this IServiceCollection services,
        IConfiguration configuration,
        Action<AuthenticationOptions>? configureOptions = null)
    {
        // Add base authentication services
        services.AddAuthenticationFeature(configuration);

        // Configure additional options if provided
        if (configureOptions != null)
        {
            services.Configure(configureOptions);
        }

        return services;
    }
}

/// <summary>
/// Configuration options for the Authentication feature
/// </summary>
public class AuthenticationOptions
{
    /// <summary>
    /// Enable or disable OTP authentication
    /// </summary>
    public bool EnableOtpAuth { get; set; } = true;

    /// <summary>
    /// Enable or disable password authentication
    /// </summary>
    public bool EnablePasswordAuth { get; set; } = true;

    /// <summary>
    /// OTP code length (default: 6)
    /// </summary>
    public int OtpLength { get; set; } = 6;

    /// <summary>
    /// OTP expiry time in minutes (default: 10)
    /// </summary>
    public int OtpExpiryMinutes { get; set; } = 10;

    /// <summary>
    /// Maximum OTP attempts before lockout (default: 5)
    /// </summary>
    public int MaxOtpAttempts { get; set; } = 5;

    /// <summary>
    /// Rate limiting for OTP requests in minutes (default: 1)
    /// </summary>
    public int OtpRateLimitMinutes { get; set; } = 1;
} 