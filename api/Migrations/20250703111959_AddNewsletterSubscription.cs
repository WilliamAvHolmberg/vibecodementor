using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddNewsletterSubscription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NewsletterSubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    SubscribedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP AT TIME ZONE 'UTC'"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    UnsubscribedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UnsubscribeReason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NewsletterSubscriptions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NewsletterSubscriptions_Email",
                table: "NewsletterSubscriptions",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NewsletterSubscriptions_IsActive_SubscribedAt",
                table: "NewsletterSubscriptions",
                columns: new[] { "IsActive", "SubscribedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_NewsletterSubscriptions_SubscribedAt",
                table: "NewsletterSubscriptions",
                column: "SubscribedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NewsletterSubscriptions");
        }
    }
}
