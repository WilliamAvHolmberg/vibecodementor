using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Source.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Source.Features.Analytics.Models;

namespace Api.Features.OpenRouter.Tools
{
    /// <summary>
    /// Visit analytics tools for OpenRouter AI - provides insights into website traffic and user behavior
    /// </summary>
    public class VisitAnalyticsTools
    {
        private readonly ApplicationDbContext _context;

        public VisitAnalyticsTools(ApplicationDbContext context)
        {
            _context = context;
        }

        [ToolMethod("Get current visit statistics and trends")]
        public async Task<VisitOverview> GetVisitOverview([ToolParameter("Optional filter (unused)")] string filter = "")
        {
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var yesterday = DateTime.UtcNow.AddDays(-1).ToString("yyyy-MM-dd");
            var weekAgo = DateTime.UtcNow.AddDays(-7).ToString("yyyy-MM-dd");

            var totalVisits = await _context.Visits.CountAsync();
            var todayStats = await _context.DailyVisitStats.FindAsync(today);
            var yesterdayStats = await _context.DailyVisitStats.FindAsync(yesterday);
            
            var last7DaysVisits = await _context.DailyVisitStats
                .Where(s => string.Compare(s.Date, weekAgo) >= 0)
                .SumAsync(s => s.VisitCount);

            var uniqueVisitorsLast7Days = await _context.Visits
                .Where(v => string.Compare(v.Date, weekAgo) >= 0)
                .Select(v => v.VisitorId)
                .Distinct()
                .CountAsync();

            return new VisitOverview
            {
                TotalVisits = totalVisits,
                TodayVisits = todayStats?.VisitCount ?? 0,
                YesterdayVisits = yesterdayStats?.VisitCount ?? 0,
                Last7DaysVisits = last7DaysVisits,
                UniqueVisitorsLast7Days = uniqueVisitorsLast7Days,
                GrowthRate = CalculateGrowthRate(todayStats?.VisitCount ?? 0, yesterdayStats?.VisitCount ?? 0)
            };
        }

        [ToolMethod("Get daily visit trends for the last X days")]
        public async Task<List<DailyTrend>> GetDailyTrends([ToolParameter("Number of days to analyze")] int days = 7)
        {
            var startDate = DateTime.UtcNow.AddDays(-days).ToString("yyyy-MM-dd");
            
            var trends = await _context.DailyVisitStats
                .Where(s => string.Compare(s.Date, startDate) >= 0)
                .OrderBy(s => s.Date)
                .Select(s => new DailyTrend 
                { 
                    Date = s.Date, 
                    VisitCount = s.VisitCount,
                    LastUpdated = s.LastUpdated
                })
                .ToListAsync();

            return trends;
        }

        [ToolMethod("Get most popular pages by visit count")]
        public async Task<List<PopularPage>> GetPopularPages([ToolParameter("Number of top pages to return")] int limit = 10)
        {
            var popularPages = await _context.Visits
                .Where(v => !string.IsNullOrEmpty(v.Path))
                .GroupBy(v => v.Path)
                .Select(g => new PopularPage
                {
                    Path = g.Key,
                    VisitCount = g.Count(),
                    UniqueVisitors = g.Select(v => v.VisitorId).Distinct().Count(),
                    LastVisited = g.Max(v => v.CreatedAt)
                })
                .OrderByDescending(p => p.VisitCount)
                .Take(limit)
                .ToListAsync();

            return popularPages;
        }

        [ToolMethod("Get referrer analysis showing traffic sources")]
        public async Task<List<ReferrerStats>> GetReferrerAnalysis([ToolParameter("Number of top referrers to return")] int limit = 10)
        {
            var referrers = await _context.Visits
                .Where(v => !string.IsNullOrEmpty(v.Referrer) && v.Referrer != "")
                .GroupBy(v => v.Referrer)
                .Select(g => new ReferrerStats
                {
                    Referrer = g.Key,
                    VisitCount = g.Count(),
                    UniqueVisitors = g.Select(v => v.VisitorId).Distinct().Count(),
                    LastReferral = g.Max(v => v.CreatedAt)
                })
                .OrderByDescending(r => r.VisitCount)
                .Take(limit)
                .ToListAsync();

            return referrers;
        }

        [ToolMethod("Get geographic insights from visitor data")]
        public async Task<List<GeographicStats>> GetGeographicInsights([ToolParameter("Number of top locations to return")] int limit = 10)
        {
            var geoStats = await _context.Visits
                .Where(v => !string.IsNullOrEmpty(v.Country))
                .GroupBy(v => new { v.Country, v.City })
                .Select(g => new GeographicStats
                {
                    Country = g.Key.Country ?? "Unknown",
                    City = g.Key.City ?? "Unknown",
                    VisitCount = g.Count(),
                    UniqueVisitors = g.Select(v => v.VisitorId).Distinct().Count()
                })
                .OrderByDescending(g => g.VisitCount)
                .Take(limit)
                .ToListAsync();

            return geoStats;
        }

        [ToolMethod("Get recent visitor activity")]
        public async Task<List<RecentVisit>> GetRecentActivity([ToolParameter("Number of recent visits to return")] int limit = 20)
        {
            var recentVisits = await _context.Visits
                .OrderByDescending(v => v.CreatedAt)
                .Take(limit)
                .Select(v => new RecentVisit
                {
                    VisitorId = v.VisitorId,
                    Path = v.Path,
                    Country = v.Country,
                    City = v.City,
                    CreatedAt = v.CreatedAt,
                    UserAgent = v.UserAgent.Length > 100 ? v.UserAgent.Substring(0, 100) + "..." : v.UserAgent
                })
                .ToListAsync();

            return recentVisits;
        }

        [ToolMethod("Get visitor retention analysis")]
        public async Task<RetentionAnalysis> GetRetentionAnalysis([ToolParameter("Number of days to analyze")] int days = 30)
        {
            var startDate = DateTime.UtcNow.AddDays(-days).ToString("yyyy-MM-dd");
            
            var totalUniqueVisitors = await _context.Visits
                .Where(v => string.Compare(v.Date, startDate) >= 0)
                .Select(v => v.VisitorId)
                .Distinct()
                .CountAsync();

            var returningVisitors = await _context.Visits
                .Where(v => string.Compare(v.Date, startDate) >= 0)
                .GroupBy(v => v.VisitorId)
                .Where(g => g.Count() > 1)
                .CountAsync();

            var retentionRate = totalUniqueVisitors > 0 ? (double)returningVisitors / totalUniqueVisitors * 100 : 0;

            return new RetentionAnalysis
            {
                AnalysisPeriodDays = days,
                TotalUniqueVisitors = totalUniqueVisitors,
                ReturningVisitors = returningVisitors,
                NewVisitors = totalUniqueVisitors - returningVisitors,
                RetentionRate = Math.Round(retentionRate, 2)
            };
        }

        private static double CalculateGrowthRate(int current, int previous)
        {
            if (previous == 0) return current > 0 ? 100.0 : 0.0;
            return Math.Round((double)(current - previous) / previous * 100, 2);
        }
    }

    // Data models for analytics responses
    public class VisitOverview
    {
        public long TotalVisits { get; set; }
        public int TodayVisits { get; set; }
        public int YesterdayVisits { get; set; }
        public int Last7DaysVisits { get; set; }
        public int UniqueVisitorsLast7Days { get; set; }
        public double GrowthRate { get; set; }
    }

    public class DailyTrend
    {
        public string Date { get; set; } = string.Empty;
        public int VisitCount { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class PopularPage
    {
        public string Path { get; set; } = string.Empty;
        public int VisitCount { get; set; }
        public int UniqueVisitors { get; set; }
        public DateTime LastVisited { get; set; }
    }

    public class ReferrerStats
    {
        public string Referrer { get; set; } = string.Empty;
        public int VisitCount { get; set; }
        public int UniqueVisitors { get; set; }
        public DateTime LastReferral { get; set; }
    }

    public class GeographicStats
    {
        public string Country { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public int VisitCount { get; set; }
        public int UniqueVisitors { get; set; }
    }

    public class RecentVisit
    {
        public string VisitorId { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public string? Country { get; set; }
        public string? City { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserAgent { get; set; } = string.Empty;
    }

    public class RetentionAnalysis
    {
        public int AnalysisPeriodDays { get; set; }
        public int TotalUniqueVisitors { get; set; }
        public int ReturningVisitors { get; set; }
        public int NewVisitors { get; set; }
        public double RetentionRate { get; set; }
    }
}