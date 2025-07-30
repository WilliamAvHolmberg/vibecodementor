using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddPrototypeBuilderTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PrototypeSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP AT TIME ZONE 'UTC'")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrototypeSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GeneratedPrototypes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP AT TIME ZONE 'UTC'")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeneratedPrototypes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GeneratedPrototypes_PrototypeSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "PrototypeSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PrototypeMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP AT TIME ZONE 'UTC'")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrototypeMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrototypeMessages_PrototypeSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "PrototypeSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedPrototypes_CreatedAt",
                table: "GeneratedPrototypes",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedPrototypes_SessionId",
                table: "GeneratedPrototypes",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedPrototypes_SessionId_CreatedAt",
                table: "GeneratedPrototypes",
                columns: new[] { "SessionId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PrototypeMessages_CreatedAt",
                table: "PrototypeMessages",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PrototypeMessages_SessionId",
                table: "PrototypeMessages",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_PrototypeMessages_SessionId_CreatedAt",
                table: "PrototypeMessages",
                columns: new[] { "SessionId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PrototypeSessions_CreatedAt",
                table: "PrototypeSessions",
                column: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GeneratedPrototypes");

            migrationBuilder.DropTable(
                name: "PrototypeMessages");

            migrationBuilder.DropTable(
                name: "PrototypeSessions");
        }
    }
}
