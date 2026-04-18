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
            TimeStart = new TimeOnly(now.Hour, now.Minute, now.Second),
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
        activeWorkout.TimeEnd = new TimeOnly(now.Hour, now.Minute, now.Second);
        activeWorkout.Comment = comment;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<List<WorkoutDto>> GetAsync(string userId, WorkoutFilter filter,
        CancellationToken cancellationToken = default)
    {
        var fromDateOnly = new DateOnly(filter.From.Year, filter.From.Month, filter.From.Day);
        var toDateOnly = new DateOnly(filter.To.Year, filter.To.Month, filter.To.Day);

        var query = _dbContext.Workouts.AsNoTracking()
            .Where(x => x.UserId == userId)
            .Where(x => x.Date >= fromDateOnly && x.Date <= toDateOnly);

        if (filter.OnlyWorkoutsWithExerciseId.HasValue)
            query = query.Where(x => x.ExerciseEntries.Any(e => e.ExerciseId == filter.OnlyWorkoutsWithExerciseId.Value));

        var workouts = await query.Select(x => new WorkoutDto
        {
            Comment = x.Comment,
            Date = x.Date,
            TimeEnd = x.TimeEnd,
            TimeStart = x.TimeStart,
            Exercises = x.ExerciseEntries.Select(x => new ExerciseDto
            {
                Id = x.ExerciseId,
                Distance = x.Distance,
                Repetitions = x.Repetitions,
                Weight = x.Weight,
                Name = x.Exercise.Name,
                Type = x.Exercise.Type,
            }).ToList()
        })
        .OrderByDescending(x => x.Date)
        .ThenByDescending(x => x.TimeEnd)
        .ToListAsync(cancellationToken);

        return workouts;
    }

    private async Task<Domain.Workout?> GetActiveWorkoutAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Workouts
            .Where(x => x.UserId == userId && x.TimeEnd == null).FirstOrDefaultAsync(cancellationToken);
    }
}
