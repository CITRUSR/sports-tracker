import { useEffect, useState } from 'react';
import api from '../api/api';

export function useExerciseOptions() {
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadExercises = async () => {
      setIsLoadingExercises(true);
      setError('');

      try {
        const data = await api.getExercises();

        if (!isCancelled) {
          setExerciseOptions(data);
        }
      } catch {
        if (!isCancelled) {
          setError('Не удалось загрузить список упражнений');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingExercises(false);
        }
      }
    };

    loadExercises();

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    exerciseOptions,
    isLoadingExercises,
    error,
  };
}
