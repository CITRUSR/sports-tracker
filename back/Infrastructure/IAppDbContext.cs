using System.Data;
using back.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace back.Infrastructure;

public interface IAppDbContext
{
    DbSet<WeightHistory> WeightHistory { get; set; }
    DbSet<UserProfile> UserProfiles { get; set; }
    DbSet<Workout> Workouts { get; set; }
    DbSet<WorkoutPause> WorkoutPauses { get; set; }
    DbSet<Exercise> Exercises { get; set; }
    DbSet<ExerciseEntry> ExerciseEntries { get; set; }
    DbSet<RefreshToken> RefreshTokens { get; set; }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    public Task<IDbContextTransaction> BeginTransactionAsync(IsolationLevel isolationLevel = IsolationLevel.ReadCommitted,
        CancellationToken cancellationToken = default);
    public Task CommitTransactionAsync(CancellationToken cancellationToken = default);
}
