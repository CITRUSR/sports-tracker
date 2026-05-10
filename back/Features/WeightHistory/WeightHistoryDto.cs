using System.ComponentModel.DataAnnotations;

namespace back.Features.WeightHistory;

public class WeightHistoryDto
{
    [Range(0.1, 1000, ErrorMessage = "Invalid weight value")]
    public decimal Weight { get; set; }
    public DateTimeOffset Date { get; set; }
}