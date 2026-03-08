using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace back.Domain;

public class Workout
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public AppUser User { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly TimeStart { get; set; }
    public TimeOnly? TimeEnd { get; set; }
    public string Comment { get; set; }
    public List<ExerciseEntry> ExerciseEntries { get; set; }
}

public class WorkoutConfiguration : IEntityTypeConfiguration<Workout>
{
    public void Configure(EntityTypeBuilder<Workout> builder)
    {
        builder.Property(x => x.UserId).IsRequired();
    }
}
