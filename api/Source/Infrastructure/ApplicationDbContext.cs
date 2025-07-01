using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Source.Features.Users.Models;
using Source.Features.Chat.Models;
using Source.Features.Analytics.Models;
using Source.Features.Files.Models;
using api.Source.Infrastructure.Services.BackgroundJobs;

namespace Source.Infrastructure;

public class ApplicationDbContext : IdentityDbContext<User>
{
    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<VisitLog> VisitLogs { get; set; }
    public DbSet<Visit> Visits { get; set; }
    public DbSet<DailyVisitStats> DailyVisitStats { get; set; }
    public DbSet<UploadedImage> UploadedImages { get; set; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // EF Core handles User entity configuration automatically
        
        // Configure ChatMessage entity
        builder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Timestamp).HasDatabaseName("IX_ChatMessages_Timestamp");
            entity.HasIndex(e => new { e.UserName, e.Timestamp }).HasDatabaseName("IX_ChatMessages_UserName_Timestamp");
            
            // Store timestamps in UTC - PostgreSQL will handle this properly
            entity.Property(e => e.Timestamp)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");
                
            entity.Property(e => e.EditedAt)
                .HasColumnType("timestamp with time zone");
        });

        // Configure VisitLog entity
        builder.Entity<VisitLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Date).IsUnique().HasDatabaseName("IX_VisitLogs_Date");
            
            entity.Property(e => e.Date)
                .HasColumnType("date");
                
            entity.Property(e => e.LastUpdated)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");
        });

        // Configure Visit entity
        builder.Entity<Visit>(entity =>
        {
            entity.HasKey(e => new { e.VisitorId, e.Date });
            entity.HasIndex(e => e.CreatedAt).HasDatabaseName("IX_Visits_CreatedAt");
            entity.HasIndex(e => e.Date).HasDatabaseName("IX_Visits_Date");
            
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");
        });

        // Configure DailyVisitStats entity
        builder.Entity<DailyVisitStats>(entity =>
        {
            entity.HasKey(e => e.Date);
            
            entity.Property(e => e.LastUpdated)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");
        });

        // Configure UploadedImage entity
        builder.Entity<UploadedImage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UploadedAt).HasDatabaseName("IX_UploadedImages_UploadedAt");
            entity.HasIndex(e => e.UploadedByUserId).HasDatabaseName("IX_UploadedImages_UploadedByUserId");
            entity.HasIndex(e => new { e.IsPublic, e.UploadedAt }).HasDatabaseName("IX_UploadedImages_IsPublic_UploadedAt");
            
            entity.Property(e => e.UploadedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");
        });
    }
} 