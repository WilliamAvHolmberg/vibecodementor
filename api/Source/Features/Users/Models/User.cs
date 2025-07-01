using Microsoft.AspNetCore.Identity;

namespace Source.Features.Users.Models;

public class User : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }

    // OTP Authentication fields
    public string? OtpCode { get; set; }
    public DateTime? OtpExpiresAt { get; set; }
    public int OtpAttempts { get; set; } = 0;
    public DateTime? LastOtpSentAt { get; set; }

    public string FullName => $"{FirstName} {LastName}".Trim();
    
    // Helper methods for OTP
    public bool IsOtpValid(string code) => 
        !string.IsNullOrEmpty(OtpCode) && 
        OtpCode == code && 
        OtpExpiresAt > DateTime.UtcNow;
    
    public bool CanRequestOtp() => 
        LastOtpSentAt == null || 
        DateTime.UtcNow.Subtract(LastOtpSentAt.Value).TotalMinutes >= 1; // 1 minute cooldown
    
    public void ClearOtp()
    {
        OtpCode = null;
        OtpExpiresAt = null;
        OtpAttempts = 0;
        LastOtpSentAt = null; // Reset rate limiting on successful auth
    }
} 