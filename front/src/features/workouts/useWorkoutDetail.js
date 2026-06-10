import { useEffect, useState } from 'react';
import api from '../api/api';

export function useWorkoutDetail(workoutId) {
  const [workout, setWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCancelled = false;

    async function loadWorkout() {
      setIsLoading(true);
      setError('');

      try {
        const data = await api.getWorkout(workoutId);

        if (isCancelled) {
          return;
        }

        if (!data) {
          setError('Тренировка не найдена');
          setWorkout(null);
          return;
        }

        setWorkout(data);
      } catch {
        if (!isCancelled) {
          setError('Не удалось загрузить тренировку');
          setWorkout(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadWorkout();

    return () => {
      isCancelled = true;
    };
  }, [workoutId]);

  return { workout, isLoading, error };
}
