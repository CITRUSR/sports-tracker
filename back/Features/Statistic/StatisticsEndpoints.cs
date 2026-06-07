using back.Common.Extensions;
using back.Common.Markers;
using Microsoft.AspNetCore.Mvc;

namespace back.Features.Statistic;

public class StatisticsEndpoints : IEndpointMarker
{
    private const string _baseRoute = "statistics";
    private const string _tag = "Statistics";

    public void MapEndpoints(RouteGroupBuilder app)
    {
        app.MapGet(_baseRoute, async ([FromServices] IStatisticsService service, HttpContext context,
            CancellationToken cancellationToken) =>
        {
            var userId = context.User.GetId();

            var statistics = await service.GetStatisticsAsync(userId, cancellationToken);

            return Results.Ok(statistics);
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Get user workout statistics")
        .Produces(StatusCodes.Status200OK, typeof(StatisticsDto));
    }
}
