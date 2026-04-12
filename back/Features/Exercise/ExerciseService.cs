using back.Common.Types;
using back.Domain;
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

    public async Task<Result> CreateExerciseAsync(string name, ExerciseType type, CancellationToken cancellationToken = default)
    {
        const string errorMessage = "Exercise with same name already exists";

        var isExerciseExists = await _dbContext.Exercises.AnyAsync(e => e.Name.ToLower() == name.ToLower(), cancellationToken);
        if (isExerciseExists)
            return Result.Failure(errorMessage);

        var exercise = new Domain.Exercise
        {
            Name = name,
            Type = type
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
}
