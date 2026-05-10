using System.Data;
using back.Common.Types;
using back.Features.Profile;
using back.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace back.Features.WeightHistory;

public class WeightHistoryService : IWeightHistoryService
{
    private readonly AppDbContext _dbContext;
    private readonly IProfileService _profileService;

    public WeightHistoryService(
        AppDbContext dbContext,
        IProfileService profileService)
    {
        _dbContext = dbContext;
        _profileService = profileService;
    }

    public async Task<Result> AddAsync(string userId, WeightHistoryDto dto, CancellationToken cancellationToken = default)
    {
        await using var transaction =
            await _dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);

        var entry = new Domain.WeightHistory
        {
            UserId = userId,
            Weight = dto.Weight,
            Date = dto.Date,
        };

        await _dbContext.WeightHistory.AddAsync(entry, cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var syncResult = await SyncProfileWeightAsync(userId, cancellationToken);
        if (!syncResult.IsSuccess)
            return syncResult;

        await _dbContext.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result> UpdateAsync(Guid recordId, string userId, WeightHistoryDto dto,
        CancellationToken cancellationToken = default)
    {
        await using var transaction =
          await _dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);

        var entry = await _dbContext.WeightHistory
            .FirstOrDefaultAsync(
                x => x.Id == recordId && x.UserId == userId,
                cancellationToken);

        if (entry == null)
            return Result.Failure("Record not found");

        entry.Weight = dto.Weight;
        entry.Date = dto.Date;

        await _dbContext.SaveChangesAsync(cancellationToken);

        var syncResult = await SyncProfileWeightAsync(userId, cancellationToken);
        if (!syncResult.IsSuccess)
            return syncResult;

        await _dbContext.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result> DeleteAsync(
        string userId,
        Guid recordId,
        CancellationToken cancellationToken = default)
    {
        await using var transaction =
                   await _dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);

        var entry = await _dbContext.WeightHistory
            .FirstOrDefaultAsync(
                x => x.Id == recordId && x.UserId == userId,
                cancellationToken);

        if (entry == null)
            return Result.Failure("Record not found");

        var firstEntryId = await _dbContext.WeightHistory
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.Date)
            .Select(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (firstEntryId == recordId)
            return Result.Failure("Cannot delete first record");

        _dbContext.WeightHistory.Remove(entry);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var syncResult = await SyncProfileWeightAsync(userId, cancellationToken);
        if (!syncResult.IsSuccess)
            return syncResult;

        await _dbContext.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result<List<WeightHistoryEntryDto>>> GetAsync(
        string userId,
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken = default)
    {
        var entries = await _dbContext.WeightHistory
            .Where(x =>
                x.UserId == userId &&
                x.Date >= from &&
                x.Date <= to)
            .OrderByDescending(x => x.Date)
            .Select(x => new WeightHistoryEntryDto
            {
                Id = x.Id,
                Weight = x.Weight,
                Date = x.Date,
            })
            .ToListAsync(cancellationToken);

        return Result<List<WeightHistoryEntryDto>>.Success(entries);
    }

    private async Task<Result> SyncProfileWeightAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var latestEntry = await _dbContext.WeightHistory
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.Date)
            .FirstOrDefaultAsync(cancellationToken);

        var profileResult =
            await _profileService.GetProfileAsync(userId, cancellationToken);

        if (!profileResult.IsSuccess)
            return Result.Failure(profileResult.ErrorsString);

        _dbContext.Attach(profileResult.Data);
        profileResult.Data.CurrentWeight = latestEntry!.Weight;

        return Result.Success();
    }
}