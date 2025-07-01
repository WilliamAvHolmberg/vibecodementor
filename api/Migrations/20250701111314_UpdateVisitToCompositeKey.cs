using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVisitToCompositeKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Clear existing visits data since we're changing the primary key structure
            migrationBuilder.Sql("DELETE FROM \"Visits\"");
            
            migrationBuilder.DropPrimaryKey(
                name: "PK_Visits",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Visits");

            migrationBuilder.AddColumn<string>(
                name: "VisitorId",
                table: "Visits",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Date",
                table: "Visits",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Visits",
                table: "Visits",
                columns: new[] { "VisitorId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_Visits_Date",
                table: "Visits",
                column: "Date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Visits",
                table: "Visits");

            migrationBuilder.DropIndex(
                name: "IX_Visits_Date",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "VisitorId",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "Visits");

            migrationBuilder.AddColumn<string>(
                name: "Id",
                table: "Visits",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Visits",
                table: "Visits",
                column: "Id");
        }
    }
}
