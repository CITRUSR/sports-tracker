import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import NumberInput from '../../../shared/components/numberInput/NumberInput';
import pageStyles from '../../../shared/layouts/gymLayout/gymPage.module.css';
import { useProfile } from '../useProfile';
import styles from './EditProfilePage.module.css';

function EditProfilePage() {
  const navigate = useNavigate();
  const { profile, needsCreate, isLoading, isSaving, error, saveProfile } = useProfile();
  const [form, setForm] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!isLoading) {
      setForm({
        name: profile?.name ?? '',
        age: profile?.age ?? 0,
        weight: profile?.weight ?? 70,
      });
    }
  }, [isLoading, profile]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (!form) {
      return;
    }

    if (!form.name.trim()) {
      setValidationError('Введите имя');
      return;
    }

    if (needsCreate && (!form.age || form.age < 12 || form.age > 120)) {
      setValidationError('Возраст должен быть от 12 до 120 лет');
      return;
    }

    if (form.weight < 25 || form.weight > 300) {
      setValidationError('Вес должен быть от 25 до 300 кг');
      return;
    }

    setValidationError('');
    const isSaved = await saveProfile(form);

    if (isSaved) {
      navigate(ROUTES.PROFILE, { state: { toast: '✅ Профиль обновлён!' } });
    }
  };

  if (isLoading || !form) {
    return <div className={pageStyles.pageStatus}>Загрузка...</div>;
  }

  return (
    <>
      <button type="button" className={styles.backBtn} onClick={() => navigate(ROUTES.PROFILE)}>
        ← Назад
      </button>
      <div className={pageStyles.pageTitle}>
        {needsCreate ? 'Заполнить профиль' : 'Редактировать профиль'}
      </div>
      <div className={`${pageStyles.pageSub} ${pageStyles.pageSubCompact}`}>
        {needsCreate
          ? 'Укажите имя, возраст и вес для создания профиля'
          : 'Обновите имя и вес. Возраст изменить нельзя.'}
      </div>

      {(error || validationError) && (
        <div className={pageStyles.pageError}>{validationError || error}</div>
      )}

      <div className={styles.formCard}>
        <div className={styles.sectionTitle}>Основное</div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="profile-name">
            Имя
          </label>
          <input
            id="profile-name"
            className={styles.formInput}
            value={form.name}
            onChange={(event) => {
              setValidationError('');
              setField('name', event.target.value);
            }}
            placeholder="Ваше имя"
          />
        </div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.sectionTitle}>Физические параметры</div>
        <div className={styles.formRow}>
          {needsCreate && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="profile-age">
                Возраст
              </label>
              <NumberInput
                id="profile-age"
                className={styles.formInput}
                value={form.age}
                onChange={(nextValue) => {
                  setValidationError('');
                  setField('age', nextValue);
                }}
                min={12}
                max={120}
                placeholder="Ваш возраст"
              />
            </div>
          )}
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="profile-weight">
              Вес (кг)
            </label>
            <input
              id="profile-weight"
              type="number"
              className={styles.formInput}
              value={form.weight}
              onChange={(event) => setField('weight', Number(event.target.value))}
              min={25}
              max={300}
            />
          </div>
        </div>
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Сохранение...' : '💾 Сохранить изменения'}
        </button>
        <button
          type="button"
          className={styles.btnOutline}
          onClick={() => navigate(ROUTES.PROFILE)}
          disabled={isSaving}
        >
          Отмена
        </button>
      </div>
    </>
  );
}

export default EditProfilePage;
