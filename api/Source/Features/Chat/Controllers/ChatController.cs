using MediatR;
using Microsoft.AspNetCore.Mvc;
using Source.Features.Chat.Queries;

namespace Source.Features.Chat.Controllers;

/// <summary>
/// API Controller for chat functionality
/// Part of the Chat feature vertical slice
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<ChatController> _logger;

    public ChatController(IMediator mediator, ILogger<ChatController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get recent chat messages with optional pagination
    /// </summary>
    /// <param name="take">Number of messages to retrieve (1-100, default 20)</param>
    /// <param name="before">Get messages before this UTC timestamp (for pagination)</param>
    /// <returns>List of recent chat messages in chronological order</returns>
    [HttpGet("messages")]
    [ProducesResponseType(typeof(List<ChatMessageDto>), 200)]
    [ProducesResponseType(typeof(object), 400)]
    public async Task<ActionResult<List<ChatMessageDto>>> GetRecentMessages([FromQuery] int take = 20, [FromQuery] DateTime? before = null)
    {
        _logger.LogInformation("📖 Fetching {Take} recent messages{Before}", 
            take, before.HasValue ? $" before {before.Value:yyyy-MM-dd HH:mm:ss} UTC" : "");

        var result = await _mediator.Send(new GetRecentMessages(take, before));

        if (result.IsFailure)
        {
            _logger.LogWarning("❌ Failed to fetch messages: {Error}", result.Error);
            return BadRequest(new { error = result.Error });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Health check for chat functionality
    /// </summary>
    [HttpGet("health")]
    [ProducesResponseType(typeof(object), 200)]
    public ActionResult<object> Health()
    {
        return Ok(new { status = "Chat service is running", timestamp = DateTime.UtcNow });
    }
} 