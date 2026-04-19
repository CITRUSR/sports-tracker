using back.Common.Types;
using back.Features.Exercise;
using back.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace back.Features.Workout;

public class WorkoutService : IWorkoutService
{
    private readonly IAppDbContext _dbContext;
    private readonly IWorkoutPauseService _pauseService;
    private readonly IWorkoutExerciseService _workoutExerciseService;
    private readonly IExerciseService _exerciseService;

    public WorkoutService(IAppDbContext dbContext, IWorkoutPauseService pauseService,
        IWorkoutExerciseService workoutExerciseService, IExerciseService exerciseService)
    {
        _dbContext = dbContext;
        _pauseService = pauseService;
        _workoutExerciseService = workoutExerciseService;
        _exerciseService = exerciseService;
    }

    public async Task<Result> BeginAsync(string userId, CancellationToken cancellationToken = default)
    {
        if ((await GetActiveWorkoutAsync(userId, cancellationToken: cancellationToken)) != null)
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
        var activeWorkout = await GetActiveWorkoutAsync(userId, true, cancellationToken: cancellationToken);
        if (activeWorkout == null)
            return Result.Failure("No workouts in progress");

        var activePause = _pauseService.GetActivePause(activeWorkout);
        if (activePause != null)
            _pauseService.Resume(activeWorkout);

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
            }).ToList(),
            Pauses = x.Pauses.Select(p => new PauseDto
            {
                StartTime = p.StartTime,
                EndTime = p.EndTime,
            }).ToList(),
        })
        .OrderByDescending(x => x.Date)
        .ThenByDescending(x => x.TimeEnd)
        .ToListAsync(cancellationToken);

        return workouts;
    }

    public async Task<Result> PauseAsync(string userId, CancellationToken cancellationToken = default)
    {
        var activeWorkout = await GetActiveWorkoutAsync(userId, true, cancellationToken);
        if (activeWorkout == null)
            return Result.Failure("No workouts in progress");

        var pauseResult = _pauseService.Pause(activeWorkout);
        if (!pauseResult.IsSuccess)
            return pauseResult;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> ResumeAsync(string userId, CancellationToken cancellationToken = default)
    {
        var activeWorkout = await GetActiveWorkoutAsync(userId, true, cancellationToken);
        if (activeWorkout == null)
            return Result.Failure("No workouts in progress");

        var resumeResult = _pauseService.Resume(activeWorkout);
        if (!resumeResult.IsSuccess)
            return resumeResult;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> RemoveExerciseEntryAsync(string userId, Guid workoutId, Guid entryId,
        CancellationToken cancellationToken = default)
    {
        var workout = await GetWorkoutByIdAsync(workoutId, userId, cancellationToken);
        if (workout == null)
            return Result.Failure("Workout not found");

        var removeResult = _workoutExerciseService.RemoveExerciseEntry(workout, entryId);
        if (!removeResult.IsSuccess)
            return removeResult;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result> UpdateExerciseEntryAsync(string userId, Guid workoutId, Guid entryId,
        ExerciseEntryDto exerciseEntryDto, CancellationToken cancellationToken = default)
    {
        var workoutAndExerciseResult = await GetWorkoutAndExercise(workoutId, exerciseEntryDto.ExerciseId, userId, cancellationToken);
        if (!workoutAndExerciseResult.IsSuccess)
            return Result.Failure(workoutAndExerciseResult.ErrorsString);

        var (workout, exercise) = workoutAndExerciseResult.Data;
        var updateResult = _workoutExerciseService.UpdateExerciseEntry(workout, entryId, exercise, exerciseEntryDto);
        if (!updateResult.IsSuccess)
            return updateResult;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result> AddExerciseEntryAsync(string userId, Guid workoutId, ExerciseEntryDto exerciseEntryDto,
        CancellationToken cancellationToken = default)
    {
        var workoutAndExerciseResult = await GetWorkoutAndExercise(workoutId, exerciseEntryDto.ExerciseId, userId, cancellationToken);
        if (!workoutAndExerciseResult.IsSuccess)
            return Result.Failure(workoutAndExerciseResult.ErrorsString);

        var (workout, exercise) = workoutAndExerciseResult.Data;
        var addResult = _workoutExerciseService.AddExerciseEntry(workout, exercise, exerciseEntryDto);
        if (!addResult.IsSuccess)
            return Result.Failure(addResult.ErrorsString);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    private async Task<Domain.Workout?> GetActiveWorkoutAsync(string userId, bool includePauses = false,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Workouts
            .Where(x => x.UserId == userId && x.TimeEnd == null)
            .AsNoTracking();

        if (includePauses)
            query = query.Include(x => x.Pauses);

        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<Domain.Workout?> GetWorkoutByIdAsync(Guid workoutId, string userId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Workouts
            .Where(x => x.Id == workoutId && x.UserId == userId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<Result<(Domain.Workout? workout, Exercise.ExerciseDto? exercise)>> GetWorkoutAndExercise(Guid workoutId,
        int exerciseId, string userId, CancellationToken cancellationToken = default)
    {
        var workout = await GetWorkoutByIdAsync(workoutId, userId, cancellationToken);
        if (workout == null)
            return Result<(Domain.Workout? workout, Exercise.ExerciseDto? exercise)>.Failure("Workout not found");

        var exercise = await _exerciseService.GetExerciseByIdAsync(exerciseId, userId, cancellationToken);
        if (exercise == null)
            return Result<(Domain.Workout? workout, Exercise.ExerciseDto? exercise)>.Failure("Exercise not found");

        return Result<(Domain.Workout? workout, Exercise.ExerciseDto? exercise)>.Success((workout, exercise));
    }
}
