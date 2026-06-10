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
        app.MapGet(_baseRoute, async ([FromServices] IWorkoutService workoutService, HttpContext context,
            [FromQuery] DateTimeOffset from, [FromQuery] DateTimeOffset to,
            [FromQuery] int? onlyWorkoutsWithExerciseId, CancellationToken cancellationToken) =>
        {
            var userId = context.User.GetId();

            var workouts = await workoutService.GetAsync(userId, new WorkoutFilter
            {
                From = from,
                To = to,
                OnlyWorkoutsWithExerciseId = onlyWorkoutsWithExerciseId,
            }, cancellationToken);

            return Results.Ok(workouts);
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Get workouts filtered by date range and optional exercise")
        .Produces(StatusCodes.Status200OK, typeof(List<WorkoutDto>));

        app.MapGet($"{_baseRoute}/active", async ([FromServices] IWorkoutService workoutService, HttpContext context,
            CancellationToken cancellationToken) =>
        {
            var userId = context.User.GetId();

            var activeWorkout = await workoutService.GetActiveAsync(userId, cancellationToken);
            if (activeWorkout == null)
                return Results.NotFound();

            return Results.Ok(activeWorkout);
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Get the current active workout")
        .Produces(StatusCodes.Status200OK, typeof(ActiveWorkoutDto))
        .Produces(StatusCodes.Status404NotFound);

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

        app.MapDelete($"{_baseRoute}/active", async ([FromServices] IWorkoutService workoutService, HttpContext context,
            CancellationToken cancellationToken) =>
        {
            var userId = context.User.GetId();

            var result = await workoutService.CancelAsync(userId, cancellationToken);
            if (!result.IsSuccess)
                return Results.NotFound(result.ErrorsString);

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Cancel the active workout")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound, typeof(string));

        app.MapPost($"{_baseRoute}/pause", async ([FromServices] IWorkoutService workoutService, HttpContext context) =>
        {
            var userId = context.User.GetId();

            var result = await workoutService.PauseAsync(userId);
            if (!result.IsSuccess)
            {
                if (result.ErrorsString.Contains("already", StringComparison.OrdinalIgnoreCase))
                    return Results.Conflict(result.ErrorsString);
                return Results.NotFound(result.ErrorsString);
            }

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Pause the active workout")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound, typeof(string))
        .Produces(StatusCodes.Status409Conflict, typeof(string));

        app.MapPost($"{_baseRoute}/resume", async ([FromServices] IWorkoutService workoutService, HttpContext context) =>
        {
            var userId = context.User.GetId();

            var result = await workoutService.ResumeAsync(userId);
            if (!result.IsSuccess)
            {
                if (result.ErrorsString.Contains("not paused", StringComparison.OrdinalIgnoreCase))
                    return Results.Conflict(result.ErrorsString);
                return Results.NotFound(result.ErrorsString);
            }

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Resume the active workout if it was paused")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound, typeof(string))
        .Produces(StatusCodes.Status409Conflict, typeof(string));

        app.MapPost($"{_baseRoute}/{{workoutId:guid}}/exercise-entries", async (Guid workoutId,
            [FromBody] ExerciseEntryDto dto, [FromServices] IWorkoutService workoutService, HttpContext context) =>
        {
            var userId = context.User.GetId();

            var result = await workoutService.AddExerciseEntryAsync(userId, workoutId, dto);
            if (!result.IsSuccess)
                return MapExerciseEntryError(result.ErrorsString);

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Add an exercise entry to a workout")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest, typeof(string))
        .Produces(StatusCodes.Status404NotFound, typeof(string));

        app.MapPut($"{_baseRoute}/{{workoutId:guid}}/exercise-entries/{{entryId:guid}}", async (Guid workoutId,
            Guid entryId, [FromBody] ExerciseEntryDto dto, [FromServices] IWorkoutService workoutService, HttpContext context) =>
        {
            var userId = context.User.GetId();

            var result = await workoutService.UpdateExerciseEntryAsync(userId, workoutId, entryId, dto);
            if (!result.IsSuccess)
                return MapExerciseEntryError(result.ErrorsString);

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Update an exercise entry in a workout")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest, typeof(string))
        .Produces(StatusCodes.Status404NotFound, typeof(string));

        app.MapDelete($"{_baseRoute}/{{workoutId:guid}}/exercise-entries/{{entryId:guid}}", async (Guid workoutId,
            Guid entryId, [FromServices] IWorkoutService workoutService, HttpContext context) =>
        {
            var userId = context.User.GetId();

            var result = await workoutService.RemoveExerciseEntryAsync(userId, workoutId, entryId);
            if (!result.IsSuccess)
                return MapExerciseEntryError(result.ErrorsString);

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Remove an exercise entry from a workout")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest, typeof(string))
        .Produces(StatusCodes.Status404NotFound, typeof(string));
    }

    private static IResult MapExerciseEntryError(string message)
    {
        if (message.Contains("not found", StringComparison.OrdinalIgnoreCase))
            return Results.NotFound(message);

        return Results.BadRequest(message);
    }
}
