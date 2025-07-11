using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddKanbanChatPersistence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CurrentSessionId",
                table: "KanbanBoards",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "KanbanChatSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BoardId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP AT TIME ZONE 'UTC'"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP AT TIME ZONE 'UTC'"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KanbanChatSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KanbanChatSessions_KanbanBoards_BoardId",
                        column: x => x.BoardId,
                        principalTable: "KanbanBoards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KanbanChatMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP AT TIME ZONE 'UTC'"),
                    Order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KanbanChatMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KanbanChatMessages_KanbanChatSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "KanbanChatSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_KanbanChatMessages_CreatedAt",
                table: "KanbanChatMessages",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_KanbanChatMessages_SessionId",
                table: "KanbanChatMessages",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_KanbanChatMessages_SessionId_Order",
                table: "KanbanChatMessages",
                columns: new[] { "SessionId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_KanbanChatMessages_UserId",
                table: "KanbanChatMessages",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_KanbanChatSessions_BoardId",
                table: "KanbanChatSessions",
                column: "BoardId");

            migrationBuilder.CreateIndex(
                name: "IX_KanbanChatSessions_BoardId_IsActive_UpdatedAt",
                table: "KanbanChatSessions",
                columns: new[] { "BoardId", "IsActive", "UpdatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_KanbanChatSessions_UserId",
                table: "KanbanChatSessions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "KanbanChatMessages");

            migrationBuilder.DropTable(
                name: "KanbanChatSessions");

            migrationBuilder.DropColumn(
                name: "CurrentSessionId",
                table: "KanbanBoards");
        }
    }
}
