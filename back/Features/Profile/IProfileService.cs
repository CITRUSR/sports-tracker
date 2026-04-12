using back.Common.Types;

namespace back.Features.Profile;

public interface IProfileService
{
    Task<Result> CreateProfileAsync(string userId, CreateProfileDto dto, CancellationToken cancellationToken = default);
    Task<Result> UpdateProfileAsync(string userId, UpdateProfileDto dto, CancellationToken cancellationToken = default);
}
