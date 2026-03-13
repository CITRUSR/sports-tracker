using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace back.Domain;

public class RefreshToken
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public AppUser User { get; set; }
    public string Token { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
}

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.Property(x => x.UserId).IsRequired();
        builder.Property(x => x.Token).IsRequired();
    }
}