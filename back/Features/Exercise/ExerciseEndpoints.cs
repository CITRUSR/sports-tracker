using back.Common.Extensions;
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
    }
}
