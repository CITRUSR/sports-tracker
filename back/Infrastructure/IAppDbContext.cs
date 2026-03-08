using back.Domain;
using Microsoft.EntityFrameworkCore;

namespace back.Infrastructure;

public interface IAppDbContext
{
    DbSet<WeightHistory> WeightHistory { get; set; }
    DbSet<UserProfile> UserProfiles { get; set; }
    DbSet<Workout> Workouts { get; set; }
    DbSet<Exercise> Exercises { get; set; }
    DbSet<ExerciseEntry> ExerciseEntries { get; set; }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
