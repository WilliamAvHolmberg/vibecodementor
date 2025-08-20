using Microsoft.AspNetCore.Identity;
using Source.Features.Authentication.Services;
using Source.Features.Users.Models;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Authentication.Commands;

/// <summary>
/// Command to verify OTP code and generate JWT token
/// </summary>
public record VerifyOtpCommand(string Email, string OtpCode) : ICommand<Result<VerifyOtpResponse>>;

/// <summary>
/// Response for OTP verification
/// </summary>
public record VerifyOtpResponse(string Token, string Email, DateTime ExpiresAt);

/// <summary>
/// Handler for OTP verification
/// </summary>
public class VerifyOtpHandler : ICommandHandler<VerifyOtpCommand, Result<VerifyOtpResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<VerifyOtpHandler> _logger;

    public VerifyOtpHandler(
        UserManager<User> userManager,
        IJwtTokenService jwtTokenService,
        ILogger<VerifyOtpHandler> logger)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    public async Task<Result<VerifyOtpResponse>> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("🔐 Verifying OTP for email: {Email}", request.Email);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            _logger.LogWarning("⚠️ OTP verification failed: User not found for email {Email}", request.Email);
            return Result.Failure<VerifyOtpResponse>("Invalid email or OTP code");
        }

        // Check attempt limit (max 5 attempts)
        if (user.OtpAttempts >= 5)
        {
            _logger.LogWarning("⚠️ OTP verification failed: Too many attempts for email {Email}", request.Email);
            user.ClearOtp();
            await _userManager.UpdateAsync(user);
            return Result.Failure<VerifyOtpResponse>("Too many attempts. Please request a new OTP code");
        }

        // Verify OTP
        if (!user.IsOtpValid(request.OtpCode))
        {
            user.OtpAttempts++;
            await _userManager.UpdateAsync(user);
            
            _logger.LogWarning("⚠️ OTP verification failed: Invalid code for email {Email} (Attempt {Attempts})", 
                request.Email, user.OtpAttempts);
            
            if (user.OtpAttempts >= 5)
            {
                user.ClearOtp();
                await _userManager.UpdateAsync(user);
                return Result.Failure<VerifyOtpResponse>("Too many invalid attempts. Please request a new OTP code");
            }
            
            return Result.Failure<VerifyOtpResponse>("Invalid OTP code");
        }

        // Clear OTP after successful verification
        user.ClearOtp();
        user.EmailConfirmed = true; // Confirm email on successful OTP
        var updateResult = await _userManager.UpdateAsync(user);
        
        if (!updateResult.Succeeded)
        {
            _logger.LogError("Failed to update user after OTP verification: {Email}", request.Email);
            return Result.Failure<VerifyOtpResponse>("Authentication failed");
        }

        // Generate JWT token using centralized service
        var (token, expiresAt) = await _jwtTokenService.GenerateTokenWithExpiryAsync(user, "otp");

        _logger.LogInformation("✅ OTP verified successfully for user: {Email}", request.Email);

        var response = new VerifyOtpResponse(token, user.Email!, expiresAt);
        return Result.Success(response);
    }
} 