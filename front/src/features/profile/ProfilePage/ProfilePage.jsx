import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { useProfile } from '../useProfile';
import styles from './ProfilePage.module.css';

const ProfilePage = observer(function ProfilePage() {
  const { profile } = useProfile();

  return (
    <>
      <div className={styles.hero}>
        <div className={styles.avatar}>{profile.avatar}</div>
        <div className={styles.heroContent}>
          <div className={styles.login}>{profile.login}</div>
        </div>
        <Link to={ROUTES.PROFILE_EDIT} className={styles.editBtn}>
          ✏️ Редактировать
        </Link>
      </div>

      <div className={styles.infoCard}>
        <div className={styles.sectionTitle}>Личные данные</div>
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
      </div>
    </>
  );
});

export default ProfilePage;
