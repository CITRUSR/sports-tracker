using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace back.Migrations
{
    /// <inheritdoc />
    public partial class WorkoutPauseOwnPrimaryKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkoutPauses",
                table: "WorkoutPauses");

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "WorkoutPauses",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE "WorkoutPauses"
                SET "Id" = gen_random_uuid()
                WHERE "Id" IS NULL
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "WorkoutPauses",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkoutPauses",
                table: "WorkoutPauses",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutPauses_WorkoutId",
                table: "WorkoutPauses",
                column: "WorkoutId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkoutPauses",
                table: "WorkoutPauses");

            migrationBuilder.DropIndex(
                name: "IX_WorkoutPauses_WorkoutId",
                table: "WorkoutPauses");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "WorkoutPauses");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkoutPauses",
                table: "WorkoutPauses",
                column: "WorkoutId");
        }
    }
}
