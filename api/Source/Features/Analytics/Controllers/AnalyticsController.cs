using MediatR;
using Microsoft.AspNetCore.Mvc;
using Source.Features.Analytics.Commands;

namespace Source.Features.Analytics.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(IMediator mediator, ILogger<AnalyticsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpPost("visit")]
    public async Task<ActionResult<VisitRegistrationResult>> RegisterVisit([FromBody] RegisterVisitRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.VisitorId))
        {
            return BadRequest("VisitorId is required");
        }

        var userAgent = Request.Headers.UserAgent.ToString();
        var referrer = Request.Headers.Referer.ToString();

        var command = new RegisterVisitCommand(
            request.VisitorId,
            userAgent,
            request.Path ?? "/",
            string.IsNullOrEmpty(referrer) ? null : referrer
        );

        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }

        return BadRequest(result.Error);
    }
}

public record RegisterVisitRequest(
    string VisitorId,
    string? Path = null
); 