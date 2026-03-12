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

    public AuthService(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }

    public async Task<Result<string>> LoginAsync(LoginUserDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Login == dto.Login, cancellationToken);

        if (user == null)
            return Result<string>.Failure("Invalid login or password");

        var signInResult = await _signInManager.PasswordSignInAsync(user, dto.Password, false, false);
        if (!signInResult.Succeeded)
            return Result<string>.Failure("Invalid login or password");

        return Result<string>.Success(_tokenService.GenerateToken(user));
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
