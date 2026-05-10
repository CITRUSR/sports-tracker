namespace back.Features.WeightHistory;

public class WeightHistoryEntryDto
{
    public Guid Id { get; set; }
    public decimal Weight { get; set; }
    public DateTimeOffset Date { get; set; }
}
