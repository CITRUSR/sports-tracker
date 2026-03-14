using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace back.Domain;

public class AppUser : IdentityUser
{
    public string Login { get; set; }
}

public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {
        builder.Property(x => x.Login).IsRequired();

        builder.HasIndex(x => x.Login).IsUnique();
    }
}
