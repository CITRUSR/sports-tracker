using System.ComponentModel.DataAnnotations;
using back.Common.Helpers;
using back.Common.Markers;

namespace back.Features.Auth;

public class AuthEndpoints : IEndpointMarker
{
    private const string _baseRoute = "auth";

    public void MapEndpoints(RouteGroupBuilder app)
    {
        app.MapPost($"{_baseRoute}/register", async (RegisterUserDto dto, IAuthService authService) =>
        {
            var errors = EndpointHelpers.Validate(dto);
            if (errors.Any())
                return Results.BadRequest(errors);

            var result = await authService.RegisterUserAsync(dto);
            if (!result.IsSuccess)
                return Results.BadRequest(result.Errors);

            return Results.Ok();
        })
        .WithDescription(
            "Password must be at least 6 characters long, contain at least one uppercase letter, " +
            "one lowercase letter, one number and one special character.\n" +
            "Login must be unique.\n\n"
        )
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest, typeof(IEnumerable<string>));
    }
}
