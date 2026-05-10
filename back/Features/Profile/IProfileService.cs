using back.Common.Types;
using back.Domain;

namespace back.Features.Profile;

public interface IProfileService
{
    Task<Result<UserProfile>> GetProfileAsync(string userId, CancellationToken cancellationToken = default);
    Task<Result> CreateProfileAsync(string userId, CreateProfileDto dto, CancellationToken cancellationToken = default);
    Task<Result> UpdateProfileAsync(string userId, UpdateProfileDto dto, CancellationToken cancellationToken = default);
}
