using Microsoft.AspNetCore.Mvc;
using Source.Infrastructure.Services.Sms;
using System.ComponentModel.DataAnnotations;

namespace Source.Features.Sms.Controllers;

[ApiController]
[Route("api/[controller]")]
[Tags("Sms")]
public class SmsController : ControllerBase
{
	private readonly ISmsService _smsService;
	private readonly ILogger<SmsController> _logger;

	public SmsController(ISmsService smsService, ILogger<SmsController> logger)
	{
		_smsService = smsService;
		_logger = logger;
	}

	/// <summary>
	/// Send an SMS message
	/// </summary>
	[HttpPost("send")]
	[ProducesResponseType(typeof(SendSmsResponse), StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<ActionResult<SendSmsResponse>> Send([FromBody] SendSmsRequest request, CancellationToken cancellationToken)
	{
		// Service performs additional validation including E.164 and length rules
		var message = new SmsMessage(request.To, request.Text, request.From);
		await _smsService.SendSmsAsync(message, cancellationToken);

		_logger.LogInformation("SMS send request processed for {To}", request.To);
		return Ok(new SendSmsResponse(true));
	}
}

public record SendSmsRequest(
	[Required]
	[StringLength(16, MinimumLength = 8)]
	[RegularExpression("^\\+[1-9]\\d{7,14}$", ErrorMessage = "Recipient must be E.164 format, e.g. +46701234567")]
	string To,

	[Required]
	[StringLength(1600, MinimumLength = 1)]
	string Text,

	// Optional. If not provided, server-side default numeric sender is used
	string? From = null
);

public record SendSmsResponse(bool Success);


