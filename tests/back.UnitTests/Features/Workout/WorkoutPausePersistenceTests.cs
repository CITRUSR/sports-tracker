using back.Features.Workout;
using back.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace back.UnitTests.Features.Workout;

public class WorkoutPausePersistenceTests
{
    [Fact]
    public async Task PauseAsync_PersistsMultiplePauses()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var db = new AppDbContext(options);

        var workout = new Domain.Workout
        {
            Id = Guid.NewGuid(),
            UserId = "user1",
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            TimeStart = TimeOnly.FromDateTime(DateTime.UtcNow)
        };

        db.Workouts.Add(workout);
        await db.SaveChangesAsync();

        var service = new WorkoutService(
            db,
            new WorkoutPauseService(),
            new WorkoutExerciseService(),
            new MockExerciseService());

        Assert.True((await service.PauseAsync("user1")).IsSuccess);
        Assert.True((await service.ResumeAsync("user1")).IsSuccess);
        Assert.True((await service.PauseAsync("user1")).IsSuccess);

        var pauses = await db.WorkoutPauses.Where(x => x.WorkoutId == workout.Id).ToListAsync();
        Assert.Equal(2, pauses.Count);
        Assert.All(pauses, pause => Assert.NotEqual(Guid.Empty, pause.Id));
        Assert.Single(pauses, pause => pause.EndTime == null);
    }

    private sealed class MockExerciseService : back.Features.Exercise.IExerciseService
    {
        public Task<back.Features.Exercise.ExerciseDto?> GetExerciseByIdAsync(int id, string userId,
            CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();

        public Task<List<back.Features.Exercise.ExerciseDto>> GetExercisesAsync(string userId,
            CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();

        public Task<back.Common.Types.Result> CreateExerciseAsync(back.Features.Exercise.CreateExerciseDto dto,
            string userId, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
    }
}
