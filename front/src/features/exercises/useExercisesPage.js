import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import { getUserExercises } from './exerciseUtils';

export function useExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadExercises = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await api.getExercises();
      setExercises(data);
    } catch {
      setError('Не удалось загрузить упражнения');
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const userExercises = useMemo(() => getUserExercises(exercises), [exercises]);

  const createExercise = async ({ name, type }) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Введите название упражнения');
      return false;
    }

    setIsSaving(true);
    setError('');

    try {
      await api.createExercise(trimmedName, type);
      await loadExercises();
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не удалось добавить упражнение'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    userExercises,
    isLoading,
    isSaving,
    error,
    createExercise,
  };
}
