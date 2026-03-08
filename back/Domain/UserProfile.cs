using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace back.Domain;

public class UserProfile
{
    public string UserId { get; set; }
    public string Name { get; set; }
    public decimal CurrentWeight { get; set; }
    public DateTimeOffset DateOfBirth { get; set; }
}

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.HasKey(x => x.UserId);

        builder.HasOne<AppUser>()
            .WithOne()
            .HasForeignKey<UserProfile>(x => x.UserId)
            .IsRequired();

        builder.Property(x => x.Name).IsRequired();
    }
}