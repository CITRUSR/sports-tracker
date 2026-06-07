namespace back.Features.Statistic;

public class StatisticsDto
{
    public int WorkoutsCount { get; set; }
    public int ExercisesCount { get; set; }
    public decimal TotalVolume { get; set; }
    public TimeSpan AverageDuration { get; set; }
}
