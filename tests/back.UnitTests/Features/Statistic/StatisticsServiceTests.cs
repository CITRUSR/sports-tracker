using back.Domain;
using back.Features.Statistic;
using back.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace back.UnitTests.Features.Statistic;

public class StatisticsServiceTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static IStatisticsService CreateService(AppDbContext dbContext) =>
        new StatisticsService(dbContext);

    private static Domain.Exercise CreateExercise(int id, string name) =>
        new()
        {
            Id = id,
            Name = name,
            Type = ExerciseType.Strength,
        };

    private static Domain.Workout CreateWorkout(
        string userId,
        TimeOnly timeStart,
        TimeOnly? timeEnd = null) =>
        new()
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Date = new DateOnly(2024, 6, 1),
            TimeStart = timeStart,
            TimeEnd = timeEnd,
        };

    private static ExerciseEntry CreateEntry(
        Domain.Workout workout,
        Domain.Exercise exercise,
        decimal? weight = null,
        int? repetitions = null) =>
        new()
        {
            Id = Guid.NewGuid(),
            WorkoutId = workout.Id,
            Workout = workout,
            ExerciseId = exercise.Id,
            Exercise = exercise,
            Weight = weight,
            Repetitions = repetitions,
        };

    [Fact]
    public async Task GetStatisticsAsync_ReturnsZeros_WhenNoData()
    {
        await using var db = CreateDbContext();
        var service = CreateService(db);

        var result = await service.GetStatisticsAsync("user1");

        Assert.Equal(0, result.WorkoutsCount);
        Assert.Equal(0, result.ExercisesCount);
        Assert.Equal(0, result.TotalVolume);
        Assert.Equal(TimeSpan.Zero, result.AverageDuration);
        Assert.Null(result.FavoriteExercise);
    }

    [Fact]
    public async Task GetStatisticsAsync_CountsOnlyCurrentUserWorkouts()
    {
        await using var db = CreateDbContext();

        db.Workouts.AddRange(
            CreateWorkout("user1", new TimeOnly(10, 0), new TimeOnly(11, 0)),
            CreateWorkout("user1", new TimeOnly(12, 0), new TimeOnly(13, 0)),
            CreateWorkout("user2", new TimeOnly(14, 0), new TimeOnly(15, 0)));
        await db.SaveChangesAsync();

        var service = CreateService(db);

        var result = await service.GetStatisticsAsync("user1");

        Assert.Equal(2, result.WorkoutsCount);
    }

    [Fact]
    public async Task GetStatisticsAsync_CountsUniqueExercisesPerWorkout_NotSets()
    {
        await using var db = CreateDbContext();

        var bench = CreateExercise(1, "Bench press");
        var squat = CreateExercise(2, "Squat");
        var workout = CreateWorkout("user1", new TimeOnly(10, 0), new TimeOnly(11, 0));

        db.Exercises.AddRange(bench, squat);
        db.Workouts.Add(workout);
        db.ExerciseEntries.AddRange(
            CreateEntry(workout, bench, 80, 10),
            CreateEntry(workout, bench, 85, 8),
            CreateEntry(workout, bench, 90, 6),
            CreateEntry(workout, squat, 100, 5),
            CreateEntry(workout, squat, 110, 5));
        await db.SaveChangesAsync();

        var service = CreateService(db);

        var result = await service.GetStatisticsAsync("user1");

        Assert.Equal(2, result.ExercisesCount);
    }

    [Fact]
    public async Task GetStatisticsAsync_CalculatesTotalVolume()
    {
        await using var db = CreateDbContext();

        var bench = CreateExercise(1, "Bench press");
        var squat = CreateExercise(2, "Squat");
        var userWorkout = CreateWorkout("user1", new TimeOnly(10, 0), new TimeOnly(11, 0));
        var otherWorkout = CreateWorkout("user2", new TimeOnly(10, 0), new TimeOnly(11, 0));

        db.Exercises.AddRange(bench, squat);
        db.Workouts.AddRange(userWorkout, otherWorkout);
        db.ExerciseEntries.AddRange(
            CreateEntry(userWorkout, bench, 80, 10),
            CreateEntry(userWorkout, squat, 100, 5),
            CreateEntry(userWorkout, bench, weight: null, repetitions: 12),
            CreateEntry(otherWorkout, bench, 200, 10));
        await db.SaveChangesAsync();

        var service = CreateService(db);

        var result = await service.GetStatisticsAsync("user1");

        Assert.Equal(80 * 10 + 100 * 5, result.TotalVolume);
    }

    [Fact]
    public async Task GetStatisticsAsync_CalculatesAverageDuration_ForCompletedWorkoutsOnly()
    {
        await using var db = CreateDbContext();

        db.Workouts.AddRange(
            CreateWorkout("user1", new TimeOnly(10, 0), new TimeOnly(11, 0)),
            CreateWorkout("user1", new TimeOnly(12, 0), new TimeOnly(13, 30)),
            CreateWorkout("user1", new TimeOnly(15, 0)));
        await db.SaveChangesAsync();

        var service = CreateService(db);

        var result = await service.GetStatisticsAsync("user1");

        var expectedAverageSeconds = ((TimeSpan.FromHours(1) + TimeSpan.FromHours(1.5)) / 2).TotalSeconds;

        Assert.Equal(3, result.WorkoutsCount);
        Assert.Equal(TimeSpan.FromSeconds(expectedAverageSeconds), result.AverageDuration);
    }

    [Fact]
    public async Task GetStatisticsAsync_ReturnsZeroAverageDuration_WhenNoCompletedWorkouts()
    {
        await using var db = CreateDbContext();

        db.Workouts.Add(CreateWorkout("user1", new TimeOnly(10, 0)));
        await db.SaveChangesAsync();

        var service = CreateService(db);

        var result = await service.GetStatisticsAsync("user1");

        Assert.Equal(1, result.WorkoutsCount);
        Assert.Equal(TimeSpan.Zero, result.AverageDuration);
    }

    [Fact]
    public async Task GetStatisticsAsync_ReturnsMostFrequentExercise_AsFavorite()
    {
        await using var db = CreateDbContext();

        var bench = CreateExercise(1, "Bench press");
        var squat = CreateExercise(2, "Squat");
        var workout = CreateWorkout("user1", new TimeOnly(10, 0), new TimeOnly(11, 0));

        db.Exercises.AddRange(bench, squat);
        db.Workouts.Add(workout);
        db.ExerciseEntries.AddRange(
            CreateEntry(workout, bench, 80, 10),
            CreateEntry(workout, bench, 85, 8),
            CreateEntry(workout, bench, 90, 6),
            CreateEntry(workout, squat, 100, 5),
            CreateEntry(workout, squat, 110, 5));
        await db.SaveChangesAsync();

        var service = CreateService(db);

        var result = await service.GetStatisticsAsync("user1");

        Assert.Equal("Bench press", result.FavoriteExercise);
    }

    [Fact]
    public async Task GetStatisticsAsync_ReturnsAlphabeticallyFirstExercise_WhenCountsAreEqual()
    {
        await using var db = CreateDbContext();

        var bench = CreateExercise(1, "Bench press");
        var squat = CreateExercise(2, "Squat");
        var workout = CreateWorkout("user1", new TimeOnly(10, 0), new TimeOnly(11, 0));

        db.Exercises.AddRange(bench, squat);
        db.Workouts.Add(workout);
        db.ExerciseEntries.AddRange(
            CreateEntry(workout, bench, 80, 10),
            CreateEntry(workout, bench, 85, 8),
            CreateEntry(workout, squat, 100, 5),
            CreateEntry(workout, squat, 110, 5));
        await db.SaveChangesAsync();

        var service = CreateService(db);

        var result = await service.GetStatisticsAsync("user1");

        Assert.Equal("Bench press", result.FavoriteExercise);
    }

    [Fact]
    public async Task GetStatisticsAsync_IgnoresOtherUsersExercises_ForFavorite()
    {
        await using var db = CreateDbContext();

        var bench = CreateExercise(1, "Bench press");
        var squat = CreateExercise(2, "Squat");
        var userWorkout = CreateWorkout("user1", new TimeOnly(10, 0), new TimeOnly(11, 0));
        var otherWorkout = CreateWorkout("user2", new TimeOnly(10, 0), new TimeOnly(11, 0));

        db.Exercises.AddRange(bench, squat);
        db.Workouts.AddRange(userWorkout, otherWorkout);
        db.ExerciseEntries.AddRange(
            CreateEntry(userWorkout, squat, 100, 5),
            CreateEntry(otherWorkout, bench, 80, 10),
            CreateEntry(otherWorkout, bench, 85, 8),
            CreateEntry(otherWorkout, bench, 90, 6));
        await db.SaveChangesAsync();

        var service = CreateService(db);

        var result = await service.GetStatisticsAsync("user1");

        Assert.Equal("Squat", result.FavoriteExercise);
    }
}
