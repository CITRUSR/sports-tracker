using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace back.Domain;

public class Exercise
{
    public int Id { get; set; }
    public string Name { get; set; }
    public ExerciseType Type { get; set; }
}

public enum ExerciseType
{
    Cardio = 10,
    Strength = 20,
    Flexibility = 30,
}

public class ExerciseConfiguration : IEntityTypeConfiguration<Exercise>
{
    public void Configure(EntityTypeBuilder<Exercise> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired();
    }
}