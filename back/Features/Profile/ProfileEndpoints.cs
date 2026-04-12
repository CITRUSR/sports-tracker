using System.Security.Claims;
using back.Common.Helpers;
using back.Common.Markers;
using Microsoft.AspNetCore.Mvc;

namespace back.Features.Profile;

public class ProfileEndpoints : IEndpointMarker
{
    private const string _baseRoute = "profiles";
    private const string _tag = "Profile";

    public void MapEndpoints(RouteGroupBuilder app)
    {
        app.MapPost(_baseRoute, async ([FromServices] IProfileService profileService, [FromBody] CreateProfileDto dto,
            HttpContext context) =>
        {
            var errors = EndpointHelpers.Validate(dto);
            if (errors.Any())
                return Results.BadRequest(errors);

            var userId = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            var result = await profileService.CreateProfileAsync(userId, dto);
            if (!result.IsSuccess)
                return Results.BadRequest(result.Errors);

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Create user profile, age must be between 12 and 120 years, weight must be in kg")
        .Produces(StatusCodes.Status200OK, typeof(string))
        .Produces(StatusCodes.Status400BadRequest, typeof(IEnumerable<string>));

        app.MapPut(_baseRoute, async ([FromServices] IProfileService profileService, [FromBody] UpdateProfileDto dto,
            HttpContext context) =>
        {
            var errors = EndpointHelpers.Validate(dto);
            if (errors.Any())
                return Results.BadRequest(errors);

            var userId = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            var result = await profileService.UpdateProfileAsync(userId, dto);
            if (!result.IsSuccess)
            {
                return result.Errors.FirstOrDefault() switch
                {
                    nameof(ProfileErrors.InvalidBirthDate) => Results.BadRequest("Age must be between 12 and 120 years"),
                    nameof(ProfileErrors.ProfileNotFound) => Results.NotFound("Profile not found"),
                    _ => Results.BadRequest(result.Errors),
                };
            }

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithTags(_tag)
        .WithDescription("Update user profile, age must be between 12 and 120 years, weight must be in kg")
        .Produces(StatusCodes.Status200OK, typeof(string))
        .Produces(StatusCodes.Status400BadRequest, typeof(IEnumerable<string>))
        .Produces(StatusCodes.Status404NotFound, typeof(string));
    }
}
