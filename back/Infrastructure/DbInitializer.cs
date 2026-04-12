using back.Domain;
using Microsoft.EntityFrameworkCore;

namespace back.Infrastructure;

public class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext context)
    {
        await SeedExercisesAsync(context);
    }

    private static async Task SeedExercisesAsync(AppDbContext context)
    {
        var exercises = new List<Exercise>
        {
            // Strength
            new() { Name = "Жим лежа", Type = ExerciseType.Strength },
            new() { Name = "Присед со штангой", Type = ExerciseType.Strength },
            new() { Name = "Становая тяга", Type = ExerciseType.Strength },
            new() { Name = "Жим штанги стоя", Type = ExerciseType.Strength },
            new() { Name = "Подтягивания", Type = ExerciseType.Strength },
            new() { Name = "Тяга штанги в наклоне", Type = ExerciseType.Strength },
            new() { Name = "Отжимания на брусьях", Type = ExerciseType.Strength },
            new() { Name = "Гиперэкстензия", Type = ExerciseType.Strength },
            new() { Name = "Сгибание рук на бицепс", Type = ExerciseType.Strength },
            new() { Name = "Разгибание рук на трицепс", Type = ExerciseType.Strength },

            // Cardio
            new() { Name = "Бег на дорожке", Type = ExerciseType.Cardio },
            new() { Name = "Эллипсоид", Type = ExerciseType.Cardio },
            new() { Name = "Велотренажёр", Type = ExerciseType.Cardio },
            new() { Name = "Скакалка", Type = ExerciseType.Cardio },
            new() { Name = "Гребной тренажёр", Type = ExerciseType.Cardio },
            new() { Name = "Интервальный бег", Type = ExerciseType.Cardio },

            // Flexibility
            new() { Name = "Растяжка задней поверхности бедра", Type = ExerciseType.Flexibility },
            new() { Name = "Растяжка квадрицепса", Type = ExerciseType.Flexibility },
            new() { Name = "Растяжка плеч", Type = ExerciseType.Flexibility },
            new() { Name = "Наклоны к ногам сидя", Type = ExerciseType.Flexibility },
            new() { Name = "Поза ребенка (йога)", Type = ExerciseType.Flexibility },
            new() { Name = "Кошка-корова", Type = ExerciseType.Flexibility },
            new() { Name = "Вращения тазом и суставная разминка", Type = ExerciseType.Flexibility }
        };

        var exercisesNames = exercises.Select(e => e.Name).ToList();
        var isDbNeedToUpdate = await context.Exercises
            .Where(e => exercisesNames.Contains(e.Name)).CountAsync() != exercises.Count;
        if (isDbNeedToUpdate)
        {
            var missingExercises = await context.Exercises
                .Where(e => exercisesNames.Contains(e.Name)).Select(e => e.Name).ToListAsync();
            var exercisesToAdd = exercises.Where(e => !missingExercises.Contains(e.Name)).ToList();

            await context.Exercises.AddRangeAsync(exercisesToAdd);
            await context.SaveChangesAsync();
        }
    }
}
