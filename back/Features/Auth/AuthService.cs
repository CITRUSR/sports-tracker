using back.Common.Types;
using back.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace back.Features.Auth;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;

    public AuthService(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result> RegisterUserAsync(RegisterUserDto dto, CancellationToken cancellationToken = default)
    {
        var userWithSameLoginExists = await _userManager.Users.AnyAsync(x => x.UserName == dto.Login, cancellationToken);

        if (userWithSameLoginExists)
            return Result.Failure("User with same login already exists");

        var user = new AppUser
        {
            UserName = dto.Login,
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return Result.Failure(result.Errors.Select(x => x.Description).ToList());

        return Result.Success();
    }
}
