using Source.Features.Users.Models;
using System.Security.Claims;

namespace Source.Features.Authentication.Services;

/// <summary>
/// Service for generating and validating JWT tokens
/// Part of the Authentication feature - keeps JWT logic centralized and testable
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Generate JWT token for authenticated user
    /// </summary>
    /// <param name="user">The authenticated user</param>
    /// <param name="authMethod">Authentication method used (password, otp, etc.)</param>
    /// <returns>JWT token string</returns>
    Task<string> GenerateTokenAsync(User user, string? authMethod = null);

    /// <summary>
    /// Generate JWT token with expiry information
    /// </summary>
    /// <param name="user">The authenticated user</param>
    /// <param name="authMethod">Authentication method used</param>
    /// <returns>Token and expiry details</returns>
    Task<(string Token, DateTime ExpiresAt)> GenerateTokenWithExpiryAsync(User user, string? authMethod = null);

    /// <summary>
    /// Validate JWT token and extract claims
    /// </summary>
    /// <param name="token">JWT token to validate</param>
    /// <returns>Claims principal if valid, null if invalid</returns>
    ClaimsPrincipal? ValidateToken(string token);
} 