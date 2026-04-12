using back.Common.Types;
using back.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace back.Features.Exercise;

public class ExerciseService : IExerciseService
{
    private readonly IAppDbContext _dbContext;

    public ExerciseService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result> CreateExerciseAsync(CreateExerciseDto dto, string userId,
        CancellationToken cancellationToken = default)
    {
        const string errorMessage = "Exercise with same name already exists";

        var isExerciseExists = await _dbContext.Exercises.AnyAsync(e => e.Name.ToLower() == dto.Name.ToLower()
            && e.UserId == userId, cancellationToken);
        if (isExerciseExists)
            return Result.Failure(errorMessage);

        var exercise = new Domain.Exercise
        {
            Name = dto.Name,
            Type = dto.Type,
            UserId = userId
        };

        await _dbContext.Exercises.AddAsync(exercise, cancellationToken);

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException dEx) when
            (dEx.InnerException is PostgresException pEx && pEx.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            return Result.Failure(errorMessage);
        }

        return Result.Success();
    }

    public async Task<List<ExerciseDto>> GetExercisesAsync(string userId, CancellationToken cancellationToken = default)
    {
        var exercises = await _dbContext.Exercises.Where(x => x.UserId == null || x.UserId == userId)
            .Select(x => new ExerciseDto
            {
                Id = x.Id,
                Name = x.Name,
                Type = x.Type
            }).ToListAsync(cancellationToken);

        return exercises;
    }
}
