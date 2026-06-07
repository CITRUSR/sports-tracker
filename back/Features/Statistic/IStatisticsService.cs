namespace back.Features.Statistic;

public interface IStatisticsService
{
    Task<StatisticsDto> GetStatisticsAsync(string userId, CancellationToken cancellationToken = default);
}
