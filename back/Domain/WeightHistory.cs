using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace back.Domain;

public class WeightHistory
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public DateTimeOffset Date { get; set; }
    public decimal Weight { get; set; }
}

public class WeightHistoryConfiguration : IEntityTypeConfiguration<WeightHistory>
{
    public void Configure(EntityTypeBuilder<WeightHistory> builder)
    {
        builder.Property(x => x.UserId).IsRequired();
    }
}
