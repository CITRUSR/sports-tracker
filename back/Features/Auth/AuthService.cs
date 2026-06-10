using back.Common.Types;
using back.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace back.Features.Auth;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager,
        ITokenService tokenService, ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task<Result<LoginUserResponse>> LoginAsync(LoginUserDto dto, string oldRefreshToken,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Login == dto.Login, cancellationToken);

        if (user == null)
            return Result<LoginUserResponse>.Failure("Invalid login or password");

        var signInResult = await _signInManager.PasswordSignInAsync(user, dto.Password, false, false);
        if (!signInResult.Succeeded)
            return Result<LoginUserResponse>.Failure("Invalid login or password");

        var accessToken = _tokenService.GenerateToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        if (oldRefreshToken != null)
        {
            var revokeResult = await _tokenService.RevokeRefreshTokenAsync(oldRefreshToken);
            if (!revokeResult.IsSuccess)
                _logger.LogWarning("Failed to revoke existing refresh token from cookies: {Error}, token:{Token}",
                    revokeResult.ErrorsString, oldRefreshToken);
        }

        await _tokenService.CreateRefreshTokenAsync(refreshToken, user.Id);

        var result = new LoginUserResponse(accessToken, refreshToken);

        return Result<LoginUserResponse>.Success(result);
    }

    public async Task<Result> RegisterUserAsync(RegisterUserDto dto, CancellationToken cancellationToken = default)
    {
        var userWithSameLoginExists = await _userManager.Users.AnyAsync(x => x.Login == dto.Login, cancellationToken);

        if (userWithSameLoginExists)
            return Result.Failure("User with same login already exists");

        var user = new AppUser
        {
            Login = dto.Login,
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return Result.Failure(result.Errors.Select(x => x.Description).ToList());

        return Result.Success();
    }
}
