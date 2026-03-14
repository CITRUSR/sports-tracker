using back.Common.Types;
using back.Domain;
using back.Features.Auth;
using back.Infrastructure;
using Microsoft.Extensions.Options;
using MockQueryable.Moq;
using Moq;

namespace back.UnitTests.Features.Auth;

public class TokenServiceTests
{
    private Mock<IAppDbContext> CreateDbContextMock(List<RefreshToken>? tokens = null)
    {
        tokens ??= new List<RefreshToken>();

        var mockSet = tokens
            .BuildMockDbSet();

        var dbContextMock = new Mock<IAppDbContext>();

        dbContextMock
            .Setup(x => x.RefreshTokens)
            .Returns(mockSet.Object);

        dbContextMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        dbContextMock
            .Setup(x => x.RefreshTokens.AddAsync(It.IsAny<RefreshToken>(), It.IsAny<CancellationToken>()))
            .Callback<RefreshToken, CancellationToken>((token, _) => tokens.Add(token));

        return dbContextMock;
    }

    private TokenService CreateService(List<RefreshToken>? tokens = null)
    {
        var dbContextMock = CreateDbContextMock(tokens);

        var settings = Options.Create(new AppSettings
        {
            RefreshTokenLifeTimeInDays = 7,
            Jwt = new JwtSettings
            {
                Secret = "super_secret_key_123456789super_secret_key_123456789",
                Issuer = "test",
                Audience = "test",
                TokenLifeTimeInMinutes = 30
            }
        });

        return new TokenService(settings, dbContextMock.Object);
    }

    [Fact]
    public async Task CreateRefreshTokenAsync_CreatesToken()
    {
        var tokens = new List<RefreshToken>();

        var service = CreateService(tokens);

        await service.CreateRefreshTokenAsync("token", "user1");

        Assert.Single(tokens);
        Assert.Equal("token", tokens[0].Token);
        Assert.Equal("user1", tokens[0].UserId);
    }

    [Fact]
    public async Task RevokeRefreshTokenAsync_TokenNotFound_ReturnsFailure()
    {
        var service = CreateService(new List<RefreshToken>());

        var result = await service.RevokeRefreshTokenAsync("missing");

        Assert.False(result.IsSuccess);
        Assert.Contains("not found", result.ErrorsString);
    }

    [Fact]
    public async Task RevokeRefreshTokenAsync_Success_RevokesToken()
    {
        var tokens = new List<RefreshToken>
        {
            new RefreshToken
            {
                Token = "token",
                UserId = "user1",
                ExpiresAt = DateTimeOffset.UtcNow.AddDays(1)
            }
        };

        var service = CreateService(tokens);

        var result = await service.RevokeRefreshTokenAsync("token");

        Assert.True(result.IsSuccess);
        Assert.True(tokens[0].IsRevoked);
        Assert.NotNull(tokens[0].RevokedAt);
    }

    [Fact]
    public async Task ValidateRefreshTokenAsync_NotFound_ReturnsFailure()
    {
        var service = CreateService(new List<RefreshToken>());

        var result = await service.ValidateRefreshTokenAsync("missing");

        Assert.False(result.IsSuccess);
        Assert.Contains("not found", result.ErrorsString);
    }

    [Fact]
    public async Task ValidateRefreshTokenAsync_Revoked_ReturnsFailure()
    {
        var tokens = new List<RefreshToken>
        {
            new RefreshToken
            {
                Token = "token",
                UserId = "user1",
                IsRevoked = true,
                ExpiresAt = DateTimeOffset.UtcNow.AddDays(1)
            }
        };

        var service = CreateService(tokens);

        var result = await service.ValidateRefreshTokenAsync("token");

        Assert.False(result.IsSuccess);
        Assert.Contains("revoked", result.ErrorsString);
    }

    [Fact]
    public async Task ValidateRefreshTokenAsync_Expired_ReturnsFailure()
    {
        var tokens = new List<RefreshToken>
        {
            new RefreshToken
            {
                Token = "token",
                UserId = "user1",
                ExpiresAt = DateTimeOffset.UtcNow.AddDays(-1)
            }
        };

        var service = CreateService(tokens);

        var result = await service.ValidateRefreshTokenAsync("token");

        Assert.False(result.IsSuccess);
        Assert.Contains("expired", result.ErrorsString);
    }

    [Fact]
    public async Task ValidateRefreshTokenAsync_Valid_ReturnsSuccess()
    {
        var tokens = new List<RefreshToken>
        {
            new RefreshToken
            {
                Token = "token",
                UserId = "user1",
                ExpiresAt = DateTimeOffset.UtcNow.AddDays(1)
            }
        };

        var service = CreateService(tokens);

        var result = await service.ValidateRefreshTokenAsync("token");

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public void GenerateRefreshToken_ReturnsRandomToken()
    {
        var service = CreateService();

        var token1 = service.GenerateRefreshToken();
        var token2 = service.GenerateRefreshToken();

        Assert.NotNull(token1);
        Assert.NotEqual(token1, token2);
    }

    [Fact]
    public void GenerateToken_ReturnsJwt()
    {
        var service = CreateService();

        var user = new AppUser { Id = "user1" };

        var token = service.GenerateToken(user);

        Assert.NotNull(token);
        Assert.Contains(".", token);
    }
}