import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { activeWorkoutStore } from '../../shared/stores/activeWorkoutStore';
import api from '../api/api';
import { useExerciseOptions } from './useExerciseOptions';

async function getActiveWorkoutId() {
  const today = new Date().toISOString().split('T')[0];
  const workouts = await api.getWorkouts({ from: today, to: today });
  const activeWorkout = workouts.find((workout) => !workout.timeEnd);

  return activeWorkout?.id ?? null;
}

async function savePastWorkout({ exercises, notes }) {
  await api.beginWorkout();

  const workoutId = await getActiveWorkoutId();
  if (!workoutId) {
    throw new Error('Active workout not found');
  }

  for (const exercise of exercises) {
    for (let setIndex = 0; setIndex < exercise.sets; setIndex += 1) {
      await api.addExerciseEntry(workoutId, {
        exerciseId: exercise.exerciseId,
        weight: exercise.weight,
        repetitions: exercise.reps,
      });
    }
  }

  await api.finishWorkout(notes);
}

function getWorkoutErrorMessage(err, { fallback, conflict }) {
  if (err.response?.status === 409) {
    return conflict;
  }

  return fallback;
}

export function useWorkoutEntry() {
  const navigate = useNavigate();
  const { exerciseOptions, isLoadingExercises, error: exercisesError } = useExerciseOptions();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const beginWorkout = () => {
    setError('');

    if (activeWorkoutStore.isActive) {
      navigate(ROUTES.ACTIVE_WORKOUT);
      return;
    }

    activeWorkoutStore.startWorkout();
    navigate(ROUTES.ACTIVE_WORKOUT);
  };

  const saveWorkout = async (formExercises, notes) => {
    const validExercises = formExercises.filter((exercise) => exercise.exerciseId);

    if (!validExercises.length) {
      setError('Выберите хотя бы одно упражнение');
      return;
    }

    const invalidWeight = validExercises.some((exercise) => Number(exercise.weight) <= 0);

    if (invalidWeight) {
      setError('Укажите вес больше 0 для каждого упражнения');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      await savePastWorkout({
        exercises: validExercises.map((exercise) => ({
          exerciseId: Number(exercise.exerciseId),
          sets: Number(exercise.sets),
          reps: Number(exercise.reps),
          weight: Number(exercise.weight),
        })),
        notes,
      });

      navigate(ROUTES.WORKOUTS, {
        state: { toast: '✅ Тренировка сохранена!' },
      });
    } catch (err) {
      setError(getWorkoutErrorMessage(err, {
        fallback: 'Не удалось сохранить тренировку',
        conflict: 'Завершите активную тренировку перед сохранением новой',
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const combinedError = error || exercisesError;

  return {
    exerciseOptions,
    isLoadingExercises,
    isSaving,
    error: combinedError,
    beginWorkout,
    saveWorkout,
  };
}
