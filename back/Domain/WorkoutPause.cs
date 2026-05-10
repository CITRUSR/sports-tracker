using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace back.Domain;

public class WorkoutPause
{
    public Guid WorkoutId { get; set; }
    public Workout Workout { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
}

public class WorkoutPauseConfiguration : IEntityTypeConfiguration<WorkoutPause>
{
    public void Configure(EntityTypeBuilder<WorkoutPause> builder)
    {
        builder.HasKey(x => x.WorkoutId);

        builder.HasOne(x => x.Workout)
            .WithMany(x => x.Pauses)
            .HasForeignKey(x => x.WorkoutId);
    }
}