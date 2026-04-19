using back.Common.Extensions;
using back.Common.Markers;
using Microsoft.AspNetCore.Mvc;

namespace back.Features.Workout;

public class WorkoutEndpoints : IEndpointMarker
{
    private const string _baseRoute = "workouts";
    private const string _tag = "Workout";

    public void MapEndpoints(RouteGroupBuilder app)
    {
        app.MapPost(_baseRoute, async ([FromServices] IWorkoutService workoutService, HttpContext context) =>
        {
            var userId = context.User.GetId();

            var result = await workoutService.BeginAsync(userId);
            if (!result.IsSuccess)
                return Results.Conflict(result.ErrorsString);

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Begin workout 1 user can have only 1 active workout")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status409Conflict, typeof(string));

        // rpc style because command
        app.MapPost($"{_baseRoute}/finish", async ([FromServices] IWorkoutService workoutService, [FromBody] string? comment,
            HttpContext context) =>
        {
            var userId = context.User.GetId();

            var result = await workoutService.FinishAsync(userId, comment);
            if (!result.IsSuccess)
                return Results.NotFound(result.ErrorsString);

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Finish workout")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound, typeof(string));
    }
}
