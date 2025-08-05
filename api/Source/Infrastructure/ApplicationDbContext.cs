using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Source.Features.Users.Models;
using Source.Features.Chat.Models;
using Source.Features.Analytics.Models;
using Source.Features.Files.Models;
using Source.Features.Newsletter.Models;
using Source.Features.Kanban.Models;
using api.Source.Infrastructure.Services.BackgroundJobs;
using Source.Features.Habits.Models;
using Source.Features.ATA.Models;

namespace Source.Infrastructure;

public class ApplicationDbContext : IdentityDbContext<User>
{
    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<VisitLog> VisitLogs { get; set; }
    public DbSet<Visit> Visits { get; set; }
    public DbSet<DailyVisitStats> DailyVisitStats { get; set; }
    public DbSet<UploadedImage> UploadedImages { get; set; }
    public DbSet<NewsletterSubscription> NewsletterSubscriptions { get; set; }
    
    // Kanban entities
    public DbSet<KanbanBoard> KanbanBoards { get; set; }
    public DbSet<KanbanColumn> KanbanColumns { get; set; }
    public DbSet<KanbanTask> KanbanTasks { get; set; }
    public DbSet<KanbanChatSession> KanbanChatSessions { get; set; }
    public DbSet<KanbanChatMessage> KanbanChatMessages { get; set; }

    // Habits entities
    public DbSet<Habit> Habits { get; set; }
    public DbSet<HabitCheckIn> HabitCheckIns { get; set; }

    // ATA entities
    public DbSet<ATARequest> ATARequests { get; set; }
    public DbSet<ATALineItem> ATALineItems { get; set; }
    public DbSet<ATAComment> ATAComments { get; set; }
    public DbSet<ATAStatusHistory> ATAStatusHistory { get; set; }

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

        // Configure NewsletterSubscription entity
        builder.Entity<NewsletterSubscription>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique().HasDatabaseName("IX_NewsletterSubscriptions_Email");
            entity.HasIndex(e => e.SubscribedAt).HasDatabaseName("IX_NewsletterSubscriptions_SubscribedAt");
            entity.HasIndex(e => new { e.IsActive, e.SubscribedAt }).HasDatabaseName("IX_NewsletterSubscriptions_IsActive_SubscribedAt");
            
            entity.Property(e => e.SubscribedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");
                
            entity.Property(e => e.UnsubscribedAt)
                .HasColumnType("timestamp with time zone");
        });

        // Configure Kanban entities
        builder.Entity<KanbanBoard>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId).HasDatabaseName("IX_KanbanBoards_UserId");
            entity.HasIndex(e => new { e.UserId, e.IsActive, e.UpdatedAt }).HasDatabaseName("IX_KanbanBoards_UserId_IsActive_UpdatedAt");
            
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");
                
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");
        });

        builder.Entity<KanbanColumn>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.BoardId).HasDatabaseName("IX_KanbanColumns_BoardId");
            entity.HasIndex(e => new { e.BoardId, e.Order }).HasDatabaseName("IX_KanbanColumns_BoardId_Order");
            
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");

            entity.HasOne(e => e.Board)
                .WithMany(e => e.Columns)
                .HasForeignKey(e => e.BoardId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<KanbanTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.BoardId).HasDatabaseName("IX_KanbanTasks_BoardId");
            entity.HasIndex(e => e.ColumnId).HasDatabaseName("IX_KanbanTasks_ColumnId");
            entity.HasIndex(e => new { e.ColumnId, e.Position }).HasDatabaseName("IX_KanbanTasks_ColumnId_Position");
            
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");
                
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");

            entity.HasOne(e => e.Board)
                .WithMany(e => e.Tasks)
                .HasForeignKey(e => e.BoardId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Column)
                .WithMany(e => e.Tasks)
                .HasForeignKey(e => e.ColumnId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure KanbanChatSession entity
        builder.Entity<KanbanChatSession>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.BoardId).HasDatabaseName("IX_KanbanChatSessions_BoardId");
            entity.HasIndex(e => e.UserId).HasDatabaseName("IX_KanbanChatSessions_UserId");
            entity.HasIndex(e => new { e.BoardId, e.IsActive, e.UpdatedAt }).HasDatabaseName("IX_KanbanChatSessions_BoardId_IsActive_UpdatedAt");
            
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");
                
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");

            entity.HasOne(e => e.Board)
                .WithMany(e => e.ChatSessions)
                .HasForeignKey(e => e.BoardId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure KanbanChatMessage entity
        builder.Entity<KanbanChatMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SessionId).HasDatabaseName("IX_KanbanChatMessages_SessionId");
            entity.HasIndex(e => e.UserId).HasDatabaseName("IX_KanbanChatMessages_UserId");
            entity.HasIndex(e => new { e.SessionId, e.Order }).HasDatabaseName("IX_KanbanChatMessages_SessionId_Order");
            entity.HasIndex(e => e.CreatedAt).HasDatabaseName("IX_KanbanChatMessages_CreatedAt");
            
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");
                
            entity.Property(e => e.Content)
                .HasColumnType("text"); // Allow large content for LLM responses

            entity.HasOne(e => e.Session)
                .WithMany(e => e.Messages)
                .HasForeignKey(e => e.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
} 