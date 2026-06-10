import { useCallback, useEffect, useState } from 'react';
import api from '../api/api';
import { ageToDateOfBirth, mapProfileFromApi } from './profileUtils';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [needsCreate, setNeedsCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await api.getProfile();
      setProfile(mapProfileFromApi(data));
      setNeedsCreate(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(null);
        setNeedsCreate(true);
      } else {
        setError('Не удалось загрузить профиль');
        setProfile(null);
        setNeedsCreate(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = async ({ name, age, weight }) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Введите имя');
      return false;
    }

    setIsSaving(true);
    setError('');

    try {
      if (needsCreate) {
        await api.createProfile({
          name: trimmedName,
          currentWeight: weight,
          dateOfBirth: ageToDateOfBirth(age),
        });
      } else {
        await api.updateProfile({
          name: trimmedName,
          currentWeight: weight,
        });
      }

      await loadProfile();
      return true;
    } catch (err) {
      const message = err.response?.data?.message ?? err.response?.data;
      setError(
        typeof message === 'string'
          ? message
          : Array.isArray(message)
            ? message.join(', ')
            : 'Не удалось сохранить профиль',
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    needsCreate,
    isLoading,
    isSaving,
    error,
    saveProfile,
    reloadProfile: loadProfile,
  };
}
