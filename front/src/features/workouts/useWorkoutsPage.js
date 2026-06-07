import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import { getDefaultDateFrom, getDefaultDateTo } from './workoutUtils';

export function useWorkoutsPage() {
  const [dateFrom, setDateFrom] = useState(getDefaultDateFrom);
  const [dateTo, setDateTo] = useState(getDefaultDateTo);
  const [exerciseId, setExerciseId] = useState('');
  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadExercises = async () => {
      try {
        const data = await api.getExercises();

        if (!isCancelled) {
          setExercises(data);
        }
      } catch {
        if (!isCancelled) {
          setError('Не удалось загрузить список упражнений');
        }
      }
    };

    loadExercises();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadWorkouts = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await api.getWorkouts({
          from: dateFrom,
          to: dateTo,
          onlyWorkoutsWithExerciseId: exerciseId || undefined,
        });

        if (!isCancelled) {
          setWorkouts(data);
        }
      } catch {
        if (!isCancelled) {
          setError('Не удалось загрузить тренировки');
          setWorkouts([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadWorkouts();

    return () => {
      isCancelled = true;
    };
  }, [dateFrom, dateTo, exerciseId]);

  const completedWorkouts = useMemo(
    () => workouts.filter((workout) => workout.timeEnd),
    [workouts],
  );

  const hasActiveWorkout = useMemo(
    () => workouts.some((workout) => !workout.timeEnd),
    [workouts],
  );

  return {
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    exerciseId,
    setExerciseId,
    exercises,
    workouts,
    completedWorkouts,
    hasActiveWorkout,
    isLoading,
    error,
  };
}
