using System.Reflection;
using back.Common.Markers;

namespace back.Features.Healthcheck;

public class HealthEndpoints : IEndpointMarker
{
    public void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("/healthcheck", () =>
        {
            return Results.Ok(Assembly.GetExecutingAssembly().GetName().Version?.ToString());
        })
        .WithName("HealthCheck");
    }
}
