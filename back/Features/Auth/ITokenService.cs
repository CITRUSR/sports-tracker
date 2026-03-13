using back.Domain;

namespace back.Features.Auth;

public interface ITokenService
{
    string GenerateToken(AppUser user);
    string GenerateRefreshToken();

    Task<RefreshToken> CreateRefreshTokenAsync(string token, string userId, CancellationToken cancellationToken = default);
}
