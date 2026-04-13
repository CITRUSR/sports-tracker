using back.Common.Types;
using back.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace back.Features.Workout;

public class WorkoutService : IWorkoutService
{
    private readonly AppDbContext _dbContext;

    public WorkoutService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result> BeginAsync(string userId, CancellationToken cancellationToken = default)
    {
        if ((await GetActiveWorkoutAsync(userId, cancellationToken)) != null)
            return Result.Failure("Another workout already in progress");

        var now = DateTimeOffset.UtcNow;
        var workout = new Domain.Workout
        {
            Date = new DateOnly(now.Year, now.Month, now.Day),
            TimeStart = new TimeOnly(now.Ticks),
            UserId = userId,
        };

        await _dbContext.Workouts.AddAsync(workout, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result> FinishAsync(string userId, string comment, CancellationToken cancellationToken = default)
    {
        var activeWorkout = await GetActiveWorkoutAsync(userId, cancellationToken);
        if (activeWorkout == null)
            return Result.Failure("No workouts in progress");

        var now = DateTimeOffset.UtcNow;
        activeWorkout.TimeEnd = new TimeOnly(now.Ticks);
        activeWorkout.Comment = comment;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    private async Task<Domain.Workout?> GetActiveWorkoutAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Workouts
            .Where(x => x.UserId == userId && x.TimeEnd == null).FirstOrDefaultAsync(cancellationToken);
    }
}
