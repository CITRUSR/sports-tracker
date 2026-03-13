using back.Common.Types;

namespace back.Features.Auth;

public interface IAuthService
{
    Task<Result> RegisterUserAsync(RegisterUserDto dto, CancellationToken cancellationToken = default);
    Task<Result<LoginUserResponse>> LoginAsync(LoginUserDto dto, CancellationToken cancellationToken = default);
}
