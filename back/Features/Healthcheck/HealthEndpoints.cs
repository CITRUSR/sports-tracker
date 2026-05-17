using System.Reflection;
using back.Common.Markers;
using Microsoft.AspNetCore.Mvc;

namespace back.Features.Healthcheck;

public class HealthEndpoints : IEndpointMarker
{
    public void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("/healthcheck", ([FromServices] ILogger<HealthEndpoints> logger) =>
        {
            logger.LogInformation("Health check endpoint called.");
            return Results.Ok(Assembly.GetExecutingAssembly().GetName().Version?.ToString());
        })
        .WithName("HealthCheck");
    }
}
