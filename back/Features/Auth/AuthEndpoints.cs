using back.Common.Helpers;
using back.Common.Markers;

namespace back.Features.Auth;

public class AuthEndpoints : IEndpointMarker
{
    private const string _baseRoute = "auth";
    private const string _tag = "Auth";

    public void MapEndpoints(RouteGroupBuilder app)
    {
        app.MapPost($"{_baseRoute}/login", async (LoginUserDto dto, IAuthService authService) =>
        {
            var result = await authService.LoginAsync(dto);
            if (!result.IsSuccess)
                return Results.BadRequest(result.Errors);

            return Results.Ok(result.Data);
        })
        .WithTags(_tag)
        .WithDescription("Login user")
        .Produces(StatusCodes.Status200OK, typeof(string))
        .Produces(StatusCodes.Status400BadRequest, typeof(IEnumerable<string>));

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
        .WithTags(_tag)
        .WithDescription(
            "Password must be at least 6 characters long, contain at least one uppercase letter, " +
            "one lowercase letter, one number and one special character.\n" +
            "Login must be unique.\n\n"
        )
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest, typeof(IEnumerable<string>));
    }
}
