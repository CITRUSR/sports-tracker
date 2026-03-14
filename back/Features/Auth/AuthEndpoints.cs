using back.Common.Helpers;
using back.Common.Markers;
using back.Common.Types;
using Microsoft.Extensions.Options;

namespace back.Features.Auth;

public class AuthEndpoints : IEndpointMarker
{
    private const string _baseRoute = "auth";
    private const string _tag = "Auth";
    private const string _refreshTokenCookieKey = "refresh-token";

    public void MapEndpoints(RouteGroupBuilder app)
    {
        app.MapPost($"{_baseRoute}/login", async (LoginUserDto dto, IAuthService authService,
            IOptions<AppSettings> appSettingsOpt, HttpContext context) =>
        {
            var errors = EndpointHelpers.Validate(dto);
            if (errors.Any())
                return Results.BadRequest(errors);

            var existingRefreshToken = context.Request.Cookies[_refreshTokenCookieKey];

            var result = await authService.LoginAsync(dto, existingRefreshToken);
            if (!result.IsSuccess)
                return Results.BadRequest(result.Errors);

            AddRefreshTokenToCookie(result.Data.RefreshToken, appSettingsOpt.Value.RefreshTokenLifeTimeInDays, context);

            return Results.Ok(result.Data.AccessToken);
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

        app.MapPost($"{_baseRoute}/refresh", async (HttpContext context, ITokenService tokenService,
            IOptions<AppSettings> appSettingsOpt) =>
        {
            var existingRefreshToken = context.Request.Cookies[_refreshTokenCookieKey];

            var result = await tokenService.RefreshAsync(existingRefreshToken);
            if (!result.IsSuccess)
                return Results.BadRequest(result.Errors);

            AddRefreshTokenToCookie(result.Data.RefreshToken, appSettingsOpt.Value.RefreshTokenLifeTimeInDays, context);

            return Results.Ok(result.Data.AccessToken);
        })
        .WithTags(_tag)
        .WithDescription("Refresh access token")
        .Produces(StatusCodes.Status200OK, typeof(string))
        .Produces(StatusCodes.Status400BadRequest, typeof(IEnumerable<string>))
        .Produces(StatusCodes.Status401Unauthorized);
    }

    private static void AddRefreshTokenToCookie(string refreshToken, int refreshTokenLifeTimeInDays,
        HttpContext httpContext)
    {
        httpContext.Response.Cookies.Append(_refreshTokenCookieKey, refreshToken, new CookieOptions
        {
            HttpOnly = true,
            // TODO: make secure
            Secure = false,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(refreshTokenLifeTimeInDays),
        });
    }
}
