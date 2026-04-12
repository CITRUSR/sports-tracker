using back.Common.Types;
using back.Domain;
using back.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace back.Features.Profile;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _dbContext;

    public ProfileService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result> CreateProfileAsync(string userId, ProfileDto dto,
        CancellationToken cancellationToken = default)
    {
        if (!IsBirthDateValid(dto.DateOfBirth))
            return Result.Failure("Invalid birth date.");

        var isProfileExists = await _dbContext.UserProfiles.AnyAsync(p => p.UserId == userId, cancellationToken);
        if (isProfileExists)
            return Result.Success();

        var profile = new UserProfile
        {
            UserId = userId,
            Name = dto.Name,
            CurrentWeight = dto.CurrentWeight,
            DateOfBirth = dto.DateOfBirth
        };

        await _dbContext.UserProfiles.AddAsync(profile, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    private static bool IsBirthDateValid(DateTimeOffset birthDate)
    {
        var now = DateTimeOffset.UtcNow;

        return birthDate <= now.AddYears(-12)
            && birthDate > now.AddYears(-120);
    }
}
