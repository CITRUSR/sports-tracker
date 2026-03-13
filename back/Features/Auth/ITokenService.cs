using back.Common.Types;
using back.Domain;

namespace back.Features.Auth;

public interface ITokenService
{
    string GenerateToken(AppUser user);
    string GenerateRefreshToken();

    Task<RefreshToken> CreateRefreshTokenAsync(string token, string userId, CancellationToken cancellationToken = default);
    Task<Result> RevokeRefreshTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<Result> ValidateRefreshTokenAsync(string token, CancellationToken cancellationToken = default);
}
