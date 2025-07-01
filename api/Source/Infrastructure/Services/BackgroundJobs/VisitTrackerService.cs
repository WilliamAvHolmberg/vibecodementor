using Microsoft.EntityFrameworkCore;
using Source.Infrastructure;

namespace api.Source.Infrastructure.Services.BackgroundJobs;

/// <summary>
/// Service for tracking website visits with persistent storage
/// </summary>
public interface IVisitTrackerService
{
    Task TrackVisitAsync(string? userAgent = null, string? ipAddress = null);
    Task<VisitStats> GetVisitStatsAsync();
    Task<int> GetTodayVisitsAsync();
    Task<long> GetTotalVisitsAsync();
}

public class VisitTrackerService : IVisitTrackerService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<VisitTrackerService> _logger;
    
    // In-memory cache for performance
    private static int _todayVisitsCache = 0;
    private static long _totalVisitsCache = 0;
    private static DateTime _lastCacheUpdate = DateTime.MinValue;
    private static readonly SemaphoreSlim _cacheSemaphore = new(1, 1);

    public VisitTrackerService(
        IServiceScopeFactory serviceScopeFactory,
        ILogger<VisitTrackerService> logger)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
    }

    public async Task TrackVisitAsync(string? userAgent = null, string? ipAddress = null)
    {
        try
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var today = DateTime.UtcNow.Date;
            
            // Get or create today's visit record
            var todayVisit = await context.VisitLogs
                .FirstOrDefaultAsync(v => v.Date == today);

            if (todayVisit == null)
            {
                todayVisit = new VisitLog
                {
                    Date = today,
                    VisitCount = 1,
                    UniqueVisitors = 1,
                    LastUpdated = DateTime.UtcNow
                };
                context.VisitLogs.Add(todayVisit);
            }
            else
            {
                todayVisit.VisitCount++;
                todayVisit.LastUpdated = DateTime.UtcNow;
            }

            await context.SaveChangesAsync();
            
            // Update cache
            await UpdateCacheAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to track visit");
        }
    }

    public async Task<VisitStats> GetVisitStatsAsync()
    {
        await EnsureCacheIsUpdatedAsync();
        
        return new VisitStats
        {
            TodayVisits = _todayVisitsCache,
            TotalVisits = _totalVisitsCache,
            LastUpdated = DateTime.UtcNow
        };
    }

    public async Task<int> GetTodayVisitsAsync()
    {
        await EnsureCacheIsUpdatedAsync();
        return _todayVisitsCache;
    }

    public async Task<long> GetTotalVisitsAsync()
    {
        await EnsureCacheIsUpdatedAsync();
        return _totalVisitsCache;
    }

    private async Task EnsureCacheIsUpdatedAsync()
    {
        // Update cache every minute or if it's stale
        if (DateTime.UtcNow - _lastCacheUpdate > TimeSpan.FromMinutes(1))
        {
            await UpdateCacheAsync();
        }
    }

    private async Task UpdateCacheAsync()
    {
        await _cacheSemaphore.WaitAsync();
        try
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var today = DateTime.UtcNow.Date;
            
            // Get today's visits
            var todayVisits = await context.VisitLogs
                .Where(v => v.Date == today)
                .Select(v => v.VisitCount)
                .FirstOrDefaultAsync();

            // Get total visits
            var totalVisits = await context.VisitLogs
                .SumAsync(v => (long)v.VisitCount);

            _todayVisitsCache = todayVisits;
            _totalVisitsCache = totalVisits;
            _lastCacheUpdate = DateTime.UtcNow;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update visit cache");
        }
        finally
        {
            _cacheSemaphore.Release();
        }
    }
}

/// <summary>
/// Entity for storing daily visit statistics
/// </summary>
public class VisitLog
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public int VisitCount { get; set; }
    public int UniqueVisitors { get; set; }
    public DateTime LastUpdated { get; set; }
    
    // Optional: Store additional analytics
    public string? TopUserAgent { get; set; }
    public string? TopReferrer { get; set; }
}

/// <summary>
/// DTO for visit statistics
/// </summary>
public class VisitStats
{
    public int TodayVisits { get; set; }
    public long TotalVisits { get; set; }
    public DateTime LastUpdated { get; set; }
} 