using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Source.Features.Habits.Commands;
using Source.Features.Habits.Queries;
using System.Security.Claims;

namespace Source.Features.Habits.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HabitsController : ControllerBase
{
    private readonly IMediator _mediator;

    public HabitsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<HabitForDayDto>>> GetHabitsForDay([FromQuery] string? date = null)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        // Default to today if no date provided (backward compatibility)
        var targetDate = string.IsNullOrEmpty(date) 
            ? DateOnly.FromDateTime(DateTime.UtcNow)
            : DateOnly.Parse(date);

        var query = new GetHabitsForDayQuery(userId, targetDate);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    [HttpGet("today")]
    public async Task<ActionResult<List<HabitForDayDto>>> GetTodaysHabits()
    {
        // Keep this endpoint for backward compatibility
        return await GetHabitsForDay();
    }

    [HttpPost("checkin")]
    public async Task<ActionResult<CheckInHabitResponse>> CheckInHabit([FromBody] CheckInHabitCommand request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new CheckInHabitCommand(request.HabitId, userId, request.IsSuccess, request.Reflection);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<CreateHabitResponse>> CreateHabit([FromBody] CreateHabitCommand request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new CreateHabitCommand(request.Name, userId, request.Description);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return CreatedAtAction(nameof(GetHabitsForDay), result.Value);
    }

    [HttpDelete("{habitId}")]
    public async Task<ActionResult<RemoveHabitResponse>> RemoveHabit(Guid habitId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new RemoveHabitCommand(habitId, userId);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }
} 