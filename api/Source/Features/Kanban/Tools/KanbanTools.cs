using Source.Infrastructure;
using Source.Features.Kanban.Commands;
using Source.Features.Kanban.Queries;
using MediatR;
using Api.Features.OpenRouter.Tools;

namespace Source.Features.Kanban.Tools;

/// <summary>
/// Kanban tools for OpenRouter AI - enables LLM to manipulate kanban boards
/// </summary>
public class KanbanTools
{
    private readonly IMediator _mediator;
    private readonly ILogger<KanbanTools> _logger;
    private string _currentUserId = string.Empty;

    public KanbanTools(IMediator mediator, ILogger<KanbanTools> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Set the current user context for tool operations
    /// </summary>
    public void SetUserContext(string userId)
    {
        _currentUserId = userId;
    }

    // Simple wrapper methods with fewer parameters for tool registration

    [ToolMethod("Create a new kanban board")]
    public async Task<CreateBoardResult> CreateBoardSimple(
        [ToolParameter("Board title")] string title)
    {
        return await CreateBoard(_currentUserId, title, "");
    }

    [ToolMethod("Create a new task on a kanban board")]
    public async Task<CreateTaskResult> CreateTaskSimple(
        [ToolParameter("Board ID and task details separated by | (boardId|title|description|columnName)")] string taskData)
    {
        var parts = taskData.Split('|');
        if (parts.Length < 2)
            return new CreateTaskResult { Success = false, Error = "Invalid task data format. Use: boardId|title|description|columnName" };

        var boardId = parts[0];
        var title = parts[1];
        var description = parts.Length > 2 ? parts[2] : "";
        var columnName = parts.Length > 3 ? parts[3] : "TODO";

        return await CreateTask(boardId, _currentUserId, title, description, columnName);
    }

    [ToolMethod("Move a task to a different column")]
    public async Task<MoveTaskResult> MoveTaskSimple(
        [ToolParameter("Board ID, task ID, and target column separated by | (boardId|taskId|targetColumn)")] string moveData)
    {
        var parts = moveData.Split('|');
        if (parts.Length < 3)
            return new MoveTaskResult { Success = false, Error = "Invalid move data format. Use: boardId|taskId|targetColumn" };

        return await MoveTask(parts[0], parts[1], _currentUserId, parts[2]);
    }

    [ToolMethod("Add a subtask to a task")]
    public async Task<AddSubtaskResult> AddSubtaskSimple(
        [ToolParameter("Board ID, task ID, and subtask title separated by | (boardId|taskId|subtaskTitle)")] string subtaskData)
    {
        var parts = subtaskData.Split('|');
        if (parts.Length < 3)
            return new AddSubtaskResult { Success = false, Error = "Invalid subtask data format. Use: boardId|taskId|subtaskTitle" };

        return await AddSubtask(parts[0], parts[1], _currentUserId, parts[2]);
    }

    [ToolMethod("Toggle subtask completion status")]
    public async Task<ToggleSubtaskResult> ToggleSubtaskSimple(
        [ToolParameter("Board ID, task ID, and subtask index separated by | (boardId|taskId|subtaskIndex)")] string toggleData)
    {
        var parts = toggleData.Split('|');
        if (parts.Length < 3)
            return new ToggleSubtaskResult { Success = false, Error = "Invalid toggle data format. Use: boardId|taskId|subtaskIndex" };

        if (!int.TryParse(parts[2], out var subtaskIndex))
            return new ToggleSubtaskResult { Success = false, Error = "Invalid subtask index" };

        return await ToggleSubtask(parts[0], parts[1], _currentUserId, subtaskIndex);
    }

    [ToolMethod("Get all boards for current user")]
    public async Task<GetBoardsResult> GetMyBoards([ToolParameter("Filter (unused)")] string filter = "")
    {
        return await GetBoards(_currentUserId);
    }

    [ToolMethod("Get full board details with all tasks")]
    public async Task<GetBoardDetailsResult> GetBoardDetailsSimple(
        [ToolParameter("Board ID")] string boardId)
    {
        return await GetBoardDetails(boardId, _currentUserId);
    }

    // Original methods (keeping for internal use)

    public async Task<CreateBoardResult> CreateBoard(
        string userId,
        string title,
        string description = "")
    {
        var command = new CreateBoard(userId, title, description);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return new CreateBoardResult { Success = false, Error = result.Error };

        return new CreateBoardResult
        {
            Success = true,
            BoardId = result.Value.BoardId.ToString(),
            Title = result.Value.Title,
            CreatedAt = result.Value.CreatedAt
        };
    }

    public async Task<CreateTaskResult> CreateTask(
        string boardId,
        string userId,
        string title,
        string description = "",
        string columnName = "TODO")
    {
        if (!Guid.TryParse(boardId, out var boardGuid))
            return new CreateTaskResult { Success = false, Error = "Invalid board ID" };

        var command = new CreateTask(boardGuid, userId, title, description, columnName);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return new CreateTaskResult { Success = false, Error = result.Error };

        return new CreateTaskResult
        {
            Success = true,
            TaskId = result.Value.TaskId.ToString(),
            Title = result.Value.Title,
            ColumnName = result.Value.ColumnName,
            CreatedAt = result.Value.CreatedAt
        };
    }

    public async Task<MoveTaskResult> MoveTask(
        string boardId,
        string taskId,
        string userId,
        string targetColumnName)
    {
        if (!Guid.TryParse(boardId, out var boardGuid))
            return new MoveTaskResult { Success = false, Error = "Invalid board ID" };

        if (!Guid.TryParse(taskId, out var taskGuid))
            return new MoveTaskResult { Success = false, Error = "Invalid task ID" };

        var command = new MoveTask(boardGuid, taskGuid, userId, targetColumnName);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return new MoveTaskResult { Success = false, Error = result.Error };

        return new MoveTaskResult
        {
            Success = true,
            TaskId = result.Value.TaskId.ToString(),
            Title = result.Value.Title,
            FromColumn = result.Value.FromColumn,
            ToColumn = result.Value.ToColumn,
            MovedAt = result.Value.MovedAt
        };
    }

    public async Task<AddSubtaskResult> AddSubtask(
        string boardId,
        string taskId,
        string userId,
        string subtaskTitle)
    {
        if (!Guid.TryParse(boardId, out var boardGuid))
            return new AddSubtaskResult { Success = false, Error = "Invalid board ID" };

        if (!Guid.TryParse(taskId, out var taskGuid))
            return new AddSubtaskResult { Success = false, Error = "Invalid task ID" };

        var command = new AddSubtask(boardGuid, taskGuid, userId, subtaskTitle);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return new AddSubtaskResult { Success = false, Error = result.Error };

        return new AddSubtaskResult
        {
            Success = true,
            TaskId = result.Value.TaskId.ToString(),
            TaskTitle = result.Value.TaskTitle,
            SubtaskTitle = result.Value.SubtaskTitle,
            SubtaskCount = result.Value.SubtaskCount,
            AddedAt = result.Value.AddedAt
        };
    }

    public async Task<ToggleSubtaskResult> ToggleSubtask(
        string boardId,
        string taskId,
        string userId,
        int subtaskIndex)
    {
        if (!Guid.TryParse(boardId, out var boardGuid))
            return new ToggleSubtaskResult { Success = false, Error = "Invalid board ID" };

        if (!Guid.TryParse(taskId, out var taskGuid))
            return new ToggleSubtaskResult { Success = false, Error = "Invalid task ID" };

        var command = new ToggleSubtask(boardGuid, taskGuid, userId, subtaskIndex);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return new ToggleSubtaskResult { Success = false, Error = result.Error };

        return new ToggleSubtaskResult
        {
            Success = true,
            TaskId = result.Value.TaskId.ToString(),
            TaskTitle = result.Value.TaskTitle,
            SubtaskTitle = result.Value.SubtaskTitle,
            IsCompleted = result.Value.IsCompleted,
            ToggledAt = result.Value.ToggledAt
        };
    }

    public async Task<GetBoardsResult> GetBoards(string userId)
    {
        var query = new GetUserBoards(userId);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return new GetBoardsResult { Success = false, Error = result.Error };

        return new GetBoardsResult
        {
            Success = true,
            Boards = result.Value.Select(b => new BoardSummary
            {
                Id = b.Id.ToString(),
                Title = b.Title,
                Description = b.Description,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt,
                TaskCount = b.TaskCount,
                CompletedTaskCount = b.CompletedTaskCount
            }).ToList()
        };
    }

    public async Task<GetBoardDetailsResult> GetBoardDetails(string boardId, string userId)
    {
        if (!Guid.TryParse(boardId, out var boardGuid))
            return new GetBoardDetailsResult { Success = false, Error = "Invalid board ID" };

        var query = new GetKanbanBoard(boardGuid, userId);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return new GetBoardDetailsResult { Success = false, Error = result.Error };

        var board = result.Value;
        return new GetBoardDetailsResult
        {
            Success = true,
            Board = new BoardDetails
            {
                Id = board.Id.ToString(),
                Title = board.Title,
                Description = board.Description,
                CreatedAt = board.CreatedAt,
                UpdatedAt = board.UpdatedAt,
                Columns = board.Columns.Select(c => new ColumnDetails
                {
                    Id = c.Id.ToString(),
                    Name = c.Name,
                    Order = c.Order,
                    IsCompleted = c.IsCompleted,
                    Tasks = c.Tasks.Select(t => new TaskDetails
                    {
                        Id = t.Id.ToString(),
                        Title = t.Title,
                        Description = t.Description,
                        Position = t.Position,
                        CreatedAt = t.CreatedAt,
                        UpdatedAt = t.UpdatedAt,
                        Subtasks = t.Subtasks.Select(s => new SubtaskDetails
                        {
                            Title = s.Title,
                            IsCompleted = s.IsCompleted,
                            CreatedAt = s.CreatedAt,
                            CompletedAt = s.CompletedAt
                        }).ToList()
                    }).ToList()
                }).ToList()
            }
        };
    }
}

// Data models for tool responses
public class CreateBoardResult
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public string BoardId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateTaskResult
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public string TaskId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string ColumnName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class MoveTaskResult
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public string TaskId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string FromColumn { get; set; } = string.Empty;
    public string ToColumn { get; set; } = string.Empty;
    public DateTime MovedAt { get; set; }
}

public class AddSubtaskResult
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public string TaskId { get; set; } = string.Empty;
    public string TaskTitle { get; set; } = string.Empty;
    public string SubtaskTitle { get; set; } = string.Empty;
    public int SubtaskCount { get; set; }
    public DateTime AddedAt { get; set; }
}

public class ToggleSubtaskResult
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public string TaskId { get; set; } = string.Empty;
    public string TaskTitle { get; set; } = string.Empty;
    public string SubtaskTitle { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime ToggledAt { get; set; }
}

public class GetBoardsResult
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public List<BoardSummary> Boards { get; set; } = new();
}

public class GetBoardDetailsResult
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public BoardDetails? Board { get; set; }
}

public class BoardSummary
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int TaskCount { get; set; }
    public int CompletedTaskCount { get; set; }
}

public class BoardDetails
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ColumnDetails> Columns { get; set; } = new();
}

public class ColumnDetails
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsCompleted { get; set; }
    public List<TaskDetails> Tasks { get; set; } = new();
}

public class TaskDetails
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Position { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<SubtaskDetails> Subtasks { get; set; } = new();
}

public class SubtaskDetails
{
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
} 