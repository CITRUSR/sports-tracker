
using back.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace back.Features.Statistic;

public class StatisticsService : IStatisticsService
{
    private readonly IAppDbContext _dbContext;

    public StatisticsService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<StatisticsDto> GetStatisticsAsync(string userId, CancellationToken cancellationToken = default)
    {
        var workoutsCount = await _dbContext.Workouts.CountAsync(x => x.UserId == userId, cancellationToken);

        var exercisesCount = await _dbContext.ExerciseEntries
            .Where(x => x.Workout.UserId == userId)
            .Select(x => new { x.ExerciseId, x.WorkoutId })
            .Distinct()
            .CountAsync(cancellationToken);

        var totalVolume = await _dbContext.ExerciseEntries
            .Where(x => x.Weight.HasValue && x.Repetitions.HasValue)
            .Where(x => x.Workout.UserId == userId).SumAsync(x => x.Weight * x.Repetitions, cancellationToken);

        var completed = await _dbContext.Workouts
            .Where(x => x.UserId == userId && x.TimeEnd != null)
            .Select(x => (x.TimeEnd!.Value - x.TimeStart).TotalSeconds)
            .ToListAsync(cancellationToken);
        var averageDuration = completed.Count > 0 ? completed.Average() : 0;

        return new StatisticsDto
        {
            WorkoutsCount = workoutsCount,
            ExercisesCount = exercisesCount,
            TotalVolume = totalVolume ?? 0,
            AverageDuration = TimeSpan.FromSeconds(averageDuration),
        };
    }
}
