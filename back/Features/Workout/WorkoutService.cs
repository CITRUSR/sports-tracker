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
        var isAnotherWorkoutInProgressExists = await _dbContext.Workouts
            .Where(x => x.UserId == userId && x.TimeEnd == null).AnyAsync(cancellationToken);
        if (isAnotherWorkoutInProgressExists)
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
}
