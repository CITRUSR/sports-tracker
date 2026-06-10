import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import pageStyles from '../../../shared/layouts/gymLayout/gymPage.module.css';
import { useProfile } from '../useProfile';
import styles from './EditProfilePage.module.css';

const EditProfilePage = observer(function EditProfilePage() {
  const navigate = useNavigate();
  const { profile, saveProfile } = useProfile();
  const [form, setForm] = useState({
    age: profile.age,
    weight: profile.weight,
  });

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    saveProfile({
      ...profile,
      age: form.age,
      weight: form.weight,
    });
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
        <div className={styles.sectionTitle}>Физические параметры</div>
        <div className={styles.formRow}>
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
