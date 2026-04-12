using back.Common.Types;

namespace back.Features.Profile;

public interface IProfileService
{
    Task<Result> CreateProfileAsync(string userId, ProfileDto dto, CancellationToken cancellationToken = default);
    Task<Result> UpdateProfileAsync(string userId, ProfileDto dto, CancellationToken cancellationToken = default);
}
