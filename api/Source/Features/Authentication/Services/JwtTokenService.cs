using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Source.Features.Users.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Source.Features.Authentication.Services;

/// <summary>
/// Centralized JWT token service for the Authentication feature
/// Handles token generation, validation, and configuration
/// </summary>
public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<JwtTokenService> _logger;
    private readonly UserManager<User> _userManager;

    // Cache configuration values for performance
    private readonly string _jwtKey;
    private readonly string _jwtIssuer;
    private readonly string _jwtAudience;
    private readonly int _expiryMinutes;

    public JwtTokenService(IConfiguration configuration, ILogger<JwtTokenService> logger, UserManager<User> userManager)
    {
        _configuration = configuration;
        _logger = logger;
        _userManager = userManager;

        // Load JWT configuration once
        _jwtKey = _configuration["Jwt:Key"] ?? "your-secret-key-here-minimum-32-characters-long";
        _jwtIssuer = _configuration["Jwt:Issuer"] ?? "api";
        _jwtAudience = _configuration["Jwt:Audience"] ?? "api";
        _expiryMinutes = int.TryParse(_configuration["Jwt:ExpiryMinutes"], out var minutes) ? minutes : 1440 * 30; // Default: 30 days

        _logger.LogInformation("🔐 JWT Token Service initialized (Expiry: {Minutes} minutes / {Days} days)", 
            _expiryMinutes, Math.Round(_expiryMinutes / 1440.0, 1));
    }

    public async Task<string> GenerateTokenAsync(User user, string? authMethod = null)
    {
        var (token, _) = await GenerateTokenWithExpiryAsync(user, authMethod);
        return token;
    }

    public async Task<(string Token, DateTime ExpiresAt)> GenerateTokenWithExpiryAsync(User user, string? authMethod = null)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_expiryMinutes);
        
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = await BuildUserClaimsAsync(user, authMethod);

        var token = new JwtSecurityToken(
            issuer: _jwtIssuer,
            audience: _jwtAudience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        var userRoles = await _userManager.GetRolesAsync(user);
        _logger.LogInformation("🎫 Generated JWT token for user {Email} (Roles: {Roles}, Method: {AuthMethod}, Expires: {ExpiresAt})", 
            user.Email, string.Join(", ", userRoles), authMethod ?? "unknown", expiresAt);

        return (tokenString, expiresAt);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _jwtIssuer,
                ValidAudience = _jwtAudience,
                IssuerSigningKey = securityKey,
                ClockSkew = TimeSpan.FromMinutes(5) // Allow 5 minutes clock skew
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            return principal;
        }
        catch (Exception ex)
        {
            _logger.LogWarning("🚫 Token validation failed: {Error}", ex.Message);
            return null;
        }
    }

    private async Task<List<Claim>> BuildUserClaimsAsync(User user, string? authMethod)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!)
        };

        // Add authentication method if specified
        if (!string.IsNullOrEmpty(authMethod))
        {
            claims.Add(new Claim("auth_method", authMethod));
        }

        // Add user name claims if available
        if (!string.IsNullOrEmpty(user.FirstName))
        {
            claims.Add(new Claim(ClaimTypes.GivenName, user.FirstName));
        }

        if (!string.IsNullOrEmpty(user.LastName))
        {
            claims.Add(new Claim(ClaimTypes.Surname, user.LastName));
        }

        if (!string.IsNullOrEmpty(user.FullName.Trim()))
        {
            claims.Add(new Claim(ClaimTypes.Name, user.FullName));
        }

        // Add role claims
        var userRoles = await _userManager.GetRolesAsync(user);
        foreach (var role in userRoles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        return claims;
    }
} 