using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using back.Common.Types;
using back.Domain;
using back.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace back.Features.Auth;

public class TokenService : ITokenService
{
    private readonly AppSettings _appSettings;
    private readonly IAppDbContext _dbContext;

    public TokenService(IOptions<AppSettings> appSettingsOpt, IAppDbContext dbContext)
    {
        _appSettings = appSettingsOpt.Value;
        _dbContext = dbContext;
    }

    public async Task<RefreshToken> CreateRefreshTokenAsync(string token, string userId,
        CancellationToken cancellationToken = default)
    {
        var refreshToken = new RefreshToken
        {
            Token = token,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(_appSettings.RefreshTokenLifeTimeInDays),
            UserId = userId,
        };

        await _dbContext.RefreshTokens.AddAsync(refreshToken, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return refreshToken;
    }

    public async Task<Result> RevokeRefreshTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var refreshToken = await _dbContext.RefreshTokens.FirstOrDefaultAsync(x => x.Token == token, cancellationToken);

        if (refreshToken == null)
        {
            return Result.Failure("Refresh token not found");
        }

        refreshToken.IsRevoked = true;
        refreshToken.RevokedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Result.Success();
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];

        using var generator = RandomNumberGenerator.Create();
        generator.GetBytes(randomNumber);

        return Convert.ToBase64String(randomNumber);
    }

    public string GenerateToken(AppUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_appSettings.Jwt.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
        };

        var token = new JwtSecurityToken(
            claims: claims,
            audience: _appSettings.Jwt.Audience,
            issuer: _appSettings.Jwt.Issuer,
            expires: DateTime.UtcNow.AddMinutes(_appSettings.Jwt.TokenLifeTimeInMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<Result> ValidateRefreshTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var refreshToken = await _dbContext.RefreshTokens.FirstOrDefaultAsync(x => x.Token == token, cancellationToken);
        if (refreshToken == null)
        {
            return Result.Failure("Refresh token not found");
        }

        if (refreshToken.IsRevoked)
        {
            return Result.Failure("Refresh token is revoked");
        }

        if (refreshToken.ExpiresAt < DateTimeOffset.UtcNow)
        {
            return Result.Failure("Refresh token expired");
        }

        return Result.Success();
    }
}
