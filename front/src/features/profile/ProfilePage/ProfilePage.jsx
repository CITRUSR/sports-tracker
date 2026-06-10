import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import pageStyles from '../../../shared/layouts/gymLayout/gymPage.module.css';
import ProfileAvatar from '../ProfileAvatar/ProfileAvatar';
import { useProfile } from '../useProfile';
import styles from './ProfilePage.module.css';

function ProfilePage() {
  const { profile, needsCreate, isLoading, error } = useProfile();

  return (
    <>
      <div className={styles.hero}>
        <ProfileAvatar />
        <div className={styles.heroContent}>
          <div className={styles.name}>{profile?.name ?? '—'}</div>
        </div>
        <Link to={ROUTES.PROFILE_EDIT} className={styles.editBtn}>
          {needsCreate ? 'Заполнить профиль' : '✏️ Редактировать'}
        </Link>
      </div>

      {error && <div className={pageStyles.pageError}>{error}</div>}
      {isLoading && <div className={pageStyles.pageStatus}>Загрузка...</div>}

      {!isLoading && (
        <div className={styles.infoCard}>
          <div className={styles.sectionTitle}>Личные данные</div>
          {needsCreate ? (
            <div className={styles.emptyState}>
              Профиль ещё не заполнен. Укажите имя, возраст и вес, чтобы начать.
            </div>
          ) : (
            <>
              <div className={styles.infoRow}>
                <div className={styles.infoIcon}>🎂</div>
                <div>
                  <div className={styles.infoKey}>Возраст</div>
                  <div className={styles.infoVal}>{profile.age} лет</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.infoIcon}>⚖️</div>
                <div>
                  <div className={styles.infoKey}>Вес</div>
                  <div className={styles.infoVal}>{profile.weight} кг</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default ProfilePage;
