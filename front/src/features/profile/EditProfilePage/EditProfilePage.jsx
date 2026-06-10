import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import pageStyles from '../../../shared/layouts/gymLayout/gymPage.module.css';
import { AVATARS, GOALS } from '../constants';
import { useProfile } from '../useProfile';
import styles from './EditProfilePage.module.css';

const EditProfilePage = observer(function EditProfilePage() {
  const navigate = useNavigate();
  const { profile, saveProfile } = useProfile();
  const [form, setForm] = useState({ ...profile, goal: [...profile.goal] });
  const [nameError, setNameError] = useState('');

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleGoal = (goal) => {
    setField(
      'goal',
      form.goal.includes(goal) ? form.goal.filter((item) => item !== goal) : [...form.goal, goal],
    );
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setNameError('Введите имя');
      return;
    }

    saveProfile(form);
    navigate(ROUTES.PROFILE, { state: { toast: '✅ Профиль обновлён!' } });
  };

  return (
    <div className={styles.page}>
      <button type="button" className={styles.backBtn} onClick={() => navigate(ROUTES.PROFILE)}>
        ← Назад
      </button>
      <div className={pageStyles.pageTitle}>Редактировать профиль</div>
      <div className={`${pageStyles.pageSub} ${pageStyles.pageSubCompact}`}>
        Обновите свои личные данные
      </div>

      <div className={styles.formCard}>
        <div className={styles.sectionTitle}>Аватар</div>
        <div className={styles.avatarPicker}>
          {AVATARS.map((avatar) => (
            <button
              key={avatar}
              type="button"
              className={`${styles.avatarOpt} ${form.avatar === avatar ? styles.avatarOptSelected : ''}`}
              onClick={() => setField('avatar', avatar)}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.sectionTitle}>Основное</div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="profile-name">
              Имя
            </label>
            <input
              id="profile-name"
              className={styles.formInput}
              value={form.name}
              onChange={(event) => {
                setNameError('');
                setField('name', event.target.value);
              }}
              placeholder="Ваше имя"
            />
            {nameError && <div className={pageStyles.pageError}>{nameError}</div>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="profile-handle">
              Никнейм
            </label>
            <input
              id="profile-handle"
              className={styles.formInput}
              value={form.handle}
              onChange={(event) => setField('handle', event.target.value)}
              placeholder="@username"
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="profile-bio">
            О себе
          </label>
          <textarea
            id="profile-bio"
            className={`${styles.formInput} ${styles.formTextarea}`}
            value={form.bio}
            onChange={(event) => setField('bio', event.target.value)}
            placeholder="Расскажите о себе..."
          />
        </div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.sectionTitle}>Физические параметры</div>
        <div className={`${styles.formRow} ${styles.formRowThree}`}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="profile-age">
              Возраст
            </label>
            <input
              id="profile-age"
              type="number"
              className={styles.formInput}
              value={form.age}
              onChange={(event) => setField('age', Number(event.target.value))}
              min={10}
              max={100}
            />
          </div>
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
              min={30}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="profile-height">
              Рост (см)
            </label>
            <input
              id="profile-height"
              type="number"
              className={styles.formInput}
              value={form.height}
              onChange={(event) => setField('height', Number(event.target.value))}
              min={100}
            />
          </div>
        </div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.sectionTitle}>Цели тренировок</div>
        <div className={styles.goalsWrap}>
          {GOALS.map((goal) => (
            <button
              key={goal}
              type="button"
              className={`${styles.exChip} ${form.goal.includes(goal) ? styles.exChipActive : ''}`}
              onClick={() => toggleGoal(goal)}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.btnPrimary} onClick={handleSave}>
          💾 Сохранить изменения
        </button>
        <button
          type="button"
          className={styles.btnOutline}
          onClick={() => navigate(ROUTES.PROFILE)}
        >
          Отмена
        </button>
      </div>
    </div>
  );
});

export default EditProfilePage;
