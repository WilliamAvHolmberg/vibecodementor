# Resend Email Integration Setup Guide

This guide will help you set up Resend email delivery for the rapid-dev API project.

## Overview

Resend is a modern email API built for developers. This integration replaces the console email service with real email delivery for production environments.

## Prerequisites

1. A Resend account ([Sign up here](https://resend.com/))
2. A verified domain in Resend (for production)
3. .NET 9 project with the rapid-dev setup

## Step 1: Get Your Resend API Key

1. **Sign up/Login** to [Resend](https://resend.com/)
2. **Navigate to API Keys** in your dashboard
3. **Create a new API key**:
   - Name: `rapid-dev-api` (or your project name)
   - Permission: `Sending access` (recommended) or `Full access`
4. **Copy the API key** - you'll need this for configuration

> ⚠️ **Important**: Store your API key securely and never commit it to version control!

## Step 2: Domain Setup (Production)

For production emails, you need to verify your domain:

1. **Add your domain** in the Resend dashboard
2. **Add DNS records** as instructed by Resend:
   - SPF record
   - DKIM record
   - DMARC record (optional but recommended)
3. **Verify the domain** once DNS propagates

For development/testing, you can use Resend's test email address: `delivered@resend.dev`

## Step 3: Configure Your Application

### Development Configuration

Update `appsettings.Development.json`:

```json
{
  "Email": {
    "Provider": "Resend",
    "Resend": {
      "ApiToken": "re_your_actual_api_token_here",
      "FromEmail": "noreply@yourdomain.com"
    }
  }
}
```

### Production Configuration

Update `appsettings.json`:

```json
{
  "Email": {
    "Provider": "Resend",
    "Resend": {
      "ApiToken": "",
      "FromEmail": "noreply@yourdomain.com"
    }
  }
}
```

### Environment Variables (Recommended for Production)

Set the API token via environment variable:

```bash
# Linux/macOS
export Email__Resend__ApiToken="re_your_actual_api_token_here"

# Windows
set Email__Resend__ApiToken="re_your_actual_api_token_here"

# Docker
-e Email__Resend__ApiToken="re_your_actual_api_token_here"
```

## Step 4: Testing the Integration

### Run the Tests

```bash
# Run all email tests
dotnet test --filter "ResendEmailTests"

# Run specific test
dotnet test --filter "SendEmailAsync_WithResendProvider_ShouldSendRealEmail"
```

### Manual Testing

Test user registration which triggers welcome email:

```bash
curl -X POST https://localhost:7297/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@yourdomain.com",
    "password": "TestPassword123!"
  }'
```

## Step 5: Email Templates

The current implementation supports:

- **HTML emails** (preferred)
- **Plain text emails** (fallback)
- **Template data** (for future template expansion)

### Example Welcome Email

The system automatically sends welcome emails that look like:

```html
<h1>Welcome to our API! 🚀</h1>
<p>Hi there!</p>
<p>Welcome to our awesome API platform!</p>
<p>User ID: {userId}</p>
<p>Get started by exploring our features!</p>
<p>Best regards,<br>The API Team</p>
```

## Configuration Options

### Provider Switching

```json
{
  "Email": {
    "Provider": "Console"  // Development: logs to console
    // "Provider": "Resend"   // Production: sends real emails
  }
}
```

### From Email Configuration

```json
{
  "Email": {
    "Resend": {
      "FromEmail": "noreply@yourdomain.com",  // Must be from verified domain
      "ApiToken": "re_..."
    }
  }
}
```

## Monitoring and Logs

### Application Logs

The service logs all email operations:

```
📧 Sending email via Resend to: user@example.com, Subject: Welcome!
✅ Email sent successfully via Resend. Response: {...}
```

### Resend Dashboard

Monitor your emails in the Resend dashboard:
- Delivery status
- Open rates
- Click rates
- Bounce handling

## Error Handling

The service handles common errors:

- **Invalid email addresses**: Throws `ArgumentException`
- **Invalid API key**: Throws `UnauthorizedAccessException`
- **Rate limiting**: Resend handles this automatically
- **Domain not verified**: Will fail with domain validation error

## Rate Limits

Resend free tier includes:
- **3,000 emails/month**
- **100 emails/day**

Paid plans offer higher limits.

## Security Best Practices

1. **Environment Variables**: Store API keys in environment variables
2. **Domain Verification**: Always verify your sending domain
3. **API Key Rotation**: Regularly rotate your API keys
4. **Monitoring**: Set up alerts for failed emails

## Common Issues

### "Domain not verified"
- Verify your domain in Resend dashboard
- Ensure DNS records are properly configured

### "Invalid API key"
- Check the API key is correct
- Ensure it has sufficient permissions

### "Rate limit exceeded"
- Check your Resend usage in dashboard
- Consider upgrading your plan

### Emails going to spam
- Verify your domain
- Set up SPF, DKIM, and DMARC records
- Avoid spam-trigger words in subject/content

## Testing with Real Credentials

To test with real Resend credentials:

1. Set your configuration:
```json
{
  "Email": {
    "Provider": "Resend",
    "Resend": {
      "ApiToken": "re_your_actual_token",
      "FromEmail": "test@yourdomain.com"
    }
  }
}
```

2. Run tests:
```bash
dotnet test --filter "ResendEmailTests" --logger "console;verbosity=detailed"
```

## Expected Test Results

```
📧 Sending email via Resend to: delivered@resend.dev, Subject: Test Email from .NET API - 2024-01-20 10:30:45 UTC
✅ Email sent successfully via Resend. Response: {...}
📧 Real Resend email sent successfully to delivered@resend.dev

Test Results:
✅ SendEmailAsync_WithConsoleProvider_ShouldLogToConsole: Passed
✅ SendEmailAsync_WithResendProvider_ShouldSendRealEmail: Passed
✅ SendEmailAsync_ConcurrentRequests_ShouldHandleMultipleEmails: Passed
✅ SendEmailAsync_WithBothHtmlAndText_ShouldPreferHtml: Passed
```

## Next Steps

1. **Production Setup**: Verify your domain and configure production settings
2. **Email Templates**: Consider implementing React Email templates
3. **Analytics**: Set up email tracking and analytics
4. **Webhooks**: Implement Resend webhooks for delivery status

## Support

- **Resend Documentation**: https://resend.com/docs
- **Resend Support**: https://resend.com/support
- **Project Issues**: Create an issue in the repository

---

🚀 **You're all set!** Your application now sends real emails via Resend! 