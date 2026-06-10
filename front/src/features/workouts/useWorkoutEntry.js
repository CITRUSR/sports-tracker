import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { activeWorkoutStore } from '../../shared/stores/activeWorkoutStore';
import { expandExerciseRowsToEntries } from '../activeWorkout/activeWorkoutSync';
import api from '../api/api';
import { useExerciseOptions } from './useExerciseOptions';

async function savePastWorkout({ exercises, notes }) {
  await api.beginWorkout();

  const activeWorkout = await api.getActiveWorkout();
  if (!activeWorkout?.id) {
    throw new Error('Active workout not found');
  }

  const entries = expandExerciseRowsToEntries(exercises);

  for (const entry of entries) {
    await api.addExerciseEntry(activeWorkout.id, entry);
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

  const beginWorkout = async () => {
    setError('');

    if (activeWorkoutStore.isActive) {
      navigate(ROUTES.ACTIVE_WORKOUT);
      return;
    }

    try {
      await activeWorkoutStore.startWorkout();
      navigate(ROUTES.ACTIVE_WORKOUT);
    } catch {
      setError(activeWorkoutStore.syncError || 'Не удалось начать тренировку');
    }
  };

  const saveWorkout = async (formExercises, notes) => {
    const validExercises = formExercises.filter((exercise) => exercise.exerciseId);

    if (!validExercises.length) {
      setError('Выберите хотя бы одно упражнение');
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
