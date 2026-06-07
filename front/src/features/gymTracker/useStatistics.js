import { useEffect, useState } from 'react';
import api from '../api/api';
import { EMPTY_STATISTICS } from './constants';

function parseDurationToMinutes(duration) {
  if (!duration) {
    return 0;
  }

  if (typeof duration === 'string') {
    const parts = duration.split(':').map(Number);

    if (parts.length === 3) {
      return Math.round(parts[0] * 60 + parts[1] + parts[2] / 60);
    }
  }

  return 0;
}

function mapStatistics(dto) {
  return {
    workoutsCount: dto.workoutsCount ?? 0,
    exercisesCount: dto.exercisesCount ?? 0,
    totalVolume: dto.totalVolume ?? 0,
    averageDurationMinutes: parseDurationToMinutes(dto.averageDuration),
    favoriteExercise: dto.favoriteExercise ?? null,
  };
}

export function useStatistics() {
  const [statistics, setStatistics] = useState(EMPTY_STATISTICS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadStatistics = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await api.getStatistics();

        if (!isCancelled) {
          setStatistics(mapStatistics(data));
        }
      } catch {
        if (!isCancelled) {
          setError('Не удалось загрузить статистику');
          setStatistics(EMPTY_STATISTICS);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadStatistics();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { statistics, isLoading, error };
}
