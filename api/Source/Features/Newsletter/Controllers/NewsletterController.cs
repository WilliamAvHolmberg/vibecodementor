using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MediatR;
using Source.Features.Newsletter.Commands;
using System.ComponentModel.DataAnnotations;

namespace Source.Features.Newsletter.Controllers;

[ApiController]
[Route("api/[controller]")]
[Tags("Newsletter")]
public class NewsletterController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<NewsletterController> _logger;

    public NewsletterController(IMediator mediator, ILogger<NewsletterController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Subscribe email to newsletter
    /// </summary>
    [HttpPost("subscribe")]
    // [EnableRateLimiting("EmailPolicy")]  // 🚨 Rate limited: 3 per minute
    [ProducesResponseType<SaveEmailToNewsletterResponse>(200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeToNewsletterRequest request)
    {
        var command = new SaveEmailToNewsletterCommand(request.Email);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation("Newsletter subscription processed: {Email}", request.Email);
            return Ok(result.Value);
        }

        _logger.LogWarning("Newsletter subscription failed for {Email}: {Error}", request.Email, result.Error);
        return BadRequest(new { error = result.Error });
    }
}

/// <summary>
/// Request model for newsletter subscription
/// </summary>
public record SubscribeToNewsletterRequest(
    [Required] [EmailAddress] string Email
); 