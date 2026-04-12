using back.Common.Extensions;
using back.Common.Helpers;
using back.Common.Markers;
using Microsoft.AspNetCore.Mvc;

namespace back.Features.Exercise;

public class ExerciseEndpoints : IEndpointMarker
{
    private const string _baseRoute = "exercises";
    private const string _tag = "Exercise";

    public void MapEndpoints(RouteGroupBuilder app)
    {
        app.MapGet(_baseRoute, async ([FromServices] IExerciseService exerciseService, HttpContext context) =>
        {
            var userId = context.User.GetId();

            var exercises = await exerciseService.GetExercisesAsync(userId);
            return Results.Ok(exercises);
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Get all exercises, both default and user created")
        .Produces(StatusCodes.Status200OK, typeof(List<ExerciseDto>));

        app.MapPost(_baseRoute, async ([FromServices] IExerciseService exerciseService, [FromBody] CreateExerciseDto dto,
            HttpContext context) =>
        {
            var errors = EndpointHelpers.Validate(dto);
            if (errors.Any())
                return Results.BadRequest(errors);

            var userId = context.User.GetId();

            var result = await exerciseService.CreateExerciseAsync(dto, userId);
            if (!result.IsSuccess)
                return Results.Conflict(result.ErrorsString);

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Create new exercise, exercise name must be unique for given user")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status409Conflict, typeof(string));
    }
}
