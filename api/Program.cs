using Hangfire;
using Microsoft.EntityFrameworkCore;
using Source.Infrastructure;
using Source.Infrastructure.Extensions;
using Source.Features.Chat.Hubs;
using Source.Features.Kanban.Hubs;
using api.Source.Infrastructure.Services.BackgroundJobs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddDatabaseServices(builder.Configuration);
builder.Services.AddIdentityServices();
builder.Services.AddMediatRServices();

builder.Services.AddHangfireServices(builder.Configuration);

builder.Services.AddAuthenticationServices(builder.Configuration);
builder.Services.AddOfflineFirstServices(builder.Configuration);
builder.Services.AddRealTimeServices();
builder.Services.AddMetricsServices();
builder.Services.AddRateLimitingServices();
builder.Services.AddOpenRouterServices(builder.Configuration);
builder.Services.AddTelemetryServices(builder.Configuration);
builder.Services.AddSwaggerServices();

var app = builder.Build();

// Auto-migrate database and seed development data
await app.MigrateDatabase();

if (app.Environment.IsDevelopment())
{
    await app.SeedDevelopmentData();
}

// Configure the HTTP request pipeline
app.UseSwaggerInDevelopment();

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// Hangfire Dashboard (only in development and when Hangfire is enabled)
if (app.Environment.IsDevelopment())
{
    app.UseHangfireDashboard("/hangfire");
}

// Map Controllers
app.MapControllers();

// Map SignalR hubs
app.MapHub<ChatHub>("/hubs/chat");
app.MapHub<MetricsHub>("/hubs/metrics");
app.MapHub<KanbanHub>("/hubs/kanban");

// Health check endpoint
app.MapGet("/", () => "Hello World! API is running 🚀");

app.Run();

// Make Program class accessible for testing
public partial class Program { }
