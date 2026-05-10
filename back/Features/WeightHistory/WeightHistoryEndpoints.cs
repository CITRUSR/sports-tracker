using back.Common.Extensions;
using back.Common.Helpers;
using back.Common.Markers;
using Microsoft.AspNetCore.Mvc;

namespace back.Features.WeightHistory;

public class WeightHistoryEndpoints : IEndpointMarker
{
    private const string _baseRoute = "weight-history";
    private const string _tag = "WeightHistory";

    public void MapEndpoints(RouteGroupBuilder app)
    {
        app.MapPost(_baseRoute, async ([FromServices] IWeightHistoryService service, [FromBody] WeightHistoryDto dto,
            HttpContext context, CancellationToken cancellationToken) =>
        {
            var errors = EndpointHelpers.Validate(dto);
            if (errors.Any())
                return Results.BadRequest(errors);

            var userId = context.User.GetId();

            var result = await service.AddAsync(userId, dto, cancellationToken);
            if (!result.IsSuccess)
                return Results.BadRequest(result.Errors);

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Add weight history entry")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest, typeof(IEnumerable<string>));

        app.MapPut($"{_baseRoute}/{{recordId:guid}}", async (Guid recordId, [FromServices] IWeightHistoryService service,
            [FromBody] WeightHistoryDto dto, HttpContext context, CancellationToken cancellationToken) =>
        {
            var errors = EndpointHelpers.Validate(dto);
            if (errors.Any())
                return Results.BadRequest(errors);

            var userId = context.User.GetId();

            var result = await service.UpdateAsync(recordId, userId, dto, cancellationToken);
            if (!result.IsSuccess)
                return Results.NotFound(result.Errors);

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Update weight history entry")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest, typeof(IEnumerable<string>))
        .Produces(StatusCodes.Status404NotFound, typeof(string));


        app.MapDelete($"{_baseRoute}/{{recordId:guid}}", async (Guid recordId, [FromServices] IWeightHistoryService service,
            HttpContext context, CancellationToken cancellationToken) =>
        {
            var userId = context.User.GetId();

            var result = await service.DeleteAsync(userId, recordId, cancellationToken);
            if (!result.IsSuccess)
            {
                if (result.Errors.Contains("not found"))
                    return Results.NotFound(result.Errors);

                return Results.BadRequest(result.Errors);
            }

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Delete weight history entry (cannot delete first record)")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest, typeof(IEnumerable<string>));


        app.MapGet(_baseRoute, async ([FromServices] IWeightHistoryService service, HttpContext context,
            [FromQuery] DateTimeOffset from, [FromQuery] DateTimeOffset to, CancellationToken cancellationToken) =>
        {
            var userId = context.User.GetId();

            var result = await service.GetAsync(userId, from, to, cancellationToken);
            if (!result.IsSuccess)
                return Results.BadRequest(result.Errors);

            return Results.Ok(result.Data);
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Get weight history for date range")
        .Produces(StatusCodes.Status200OK, typeof(List<WeightHistoryEntryDto>))
        .Produces(StatusCodes.Status400BadRequest, typeof(IEnumerable<string>));
    }
}