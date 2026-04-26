using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FocusArena.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGateRPGStats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RecommendedPartySize",
                table: "Gates",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RequiredLevel",
                table: "Gates",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecommendedPartySize",
                table: "Gates");

            migrationBuilder.DropColumn(
                name: "RequiredLevel",
                table: "Gates");
        }
    }
}
