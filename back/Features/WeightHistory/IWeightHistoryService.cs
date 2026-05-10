using back.Common.Types;

namespace back.Features.WeightHistory;

public interface IWeightHistoryService
{
    Task<Result> AddAsync(string userId, WeightHistoryDto dto,
        CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(Guid recordId, string userId, WeightHistoryDto dto,
        CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(string userId, Guid recordId, CancellationToken cancellationToken = default);
    Task<Result<List<WeightHistoryEntryDto>>> GetAsync(string userId, DateTimeOffset from, DateTimeOffset to,
        CancellationToken cancellationToken = default);
}
