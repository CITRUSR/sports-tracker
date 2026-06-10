import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import { getDefaultDateFrom, getDefaultDateTo } from './workoutUtils';

export function useCompletedWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadWorkouts = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await api.getWorkouts({
          from: getDefaultDateFrom(),
          to: getDefaultDateTo(),
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
  }, []);

  const completedWorkouts = useMemo(
    () => workouts.filter((workout) => workout.timeEnd),
    [workouts],
  );

  return { completedWorkouts, isLoading, error };
}
