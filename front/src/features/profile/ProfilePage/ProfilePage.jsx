import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import pageStyles from '../../../shared/layouts/gymLayout/gymPage.module.css';
import { useCompletedWorkouts } from '../../workouts/useCompletedWorkouts';
import { getWorkoutDurationMinutes } from '../../workouts/workoutStatsUtils';
import WorkoutMiniChart from '../WorkoutMiniChart/WorkoutMiniChart';
import { useProfile } from '../useProfile';
import styles from './ProfilePage.module.css';

const ProfilePage = observer(function ProfilePage() {
  const { profile } = useProfile();
  const { completedWorkouts, isLoading, error } = useCompletedWorkouts();

  const totalMinutes = completedWorkouts.reduce(
    (sum, workout) => sum + getWorkoutDurationMinutes(workout),
    0,
  );
  const avgDuration = completedWorkouts.length
    ? Math.round(totalMinutes / completedWorkouts.length)
    : 0;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.avatar}>{profile.avatar}</div>
        <div className={styles.heroContent}>
          <div className={styles.name}>{profile.name}</div>
          <div className={styles.handle}>{profile.handle}</div>
          {profile.goal.length > 0 && (
            <div className={styles.tags}>
              {profile.goal.map((goal) => (
                <span key={goal} className={styles.tag}>
                  {goal}
                </span>
              ))}
            </div>
          )}
        </div>
        <Link to={ROUTES.PROFILE_EDIT} className={styles.editBtn}>
          ✏️ Редактировать
        </Link>
      </div>

      {error && <div className={pageStyles.pageError}>{error}</div>}

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{isLoading ? '...' : completedWorkouts.length}</div>
          <div className={styles.statLbl}>Тренировок</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>
            {isLoading ? '...' : Math.round((totalMinutes / 60) * 10) / 10}
          </div>
          <div className={styles.statLbl}>Часов в зале</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{isLoading ? '...' : avgDuration}</div>
          <div className={styles.statLbl}>Мин. в среднем</div>
        </div>
      </div>

      <div className={styles.infoCard}>
        <div className={styles.sectionTitle}>Прогресс тренировок</div>
        {isLoading ? (
          <div className={pageStyles.pageStatus}>Загрузка...</div>
        ) : (
          <WorkoutMiniChart workouts={completedWorkouts} />
        )}
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
        <div className={styles.infoRow}>
          <div className={styles.infoIcon}>📏</div>
          <div>
            <div className={styles.infoKey}>Рост</div>
            <div className={styles.infoVal}>{profile.height} см</div>
          </div>
        </div>
        {profile.bio && (
          <div className={styles.infoRow}>
            <div className={styles.infoIcon}>📝</div>
            <div>
              <div className={styles.infoKey}>О себе</div>
              <div className={`${styles.infoVal} ${styles.bioVal}`}>{profile.bio}</div>
            </div>
          </div>
        )}
      </div>

      {profile.goal.length > 0 && (
        <div className={styles.infoCard}>
          <div className={styles.sectionTitle}>Цели</div>
          <div className={styles.goalsWrap}>
            {profile.goal.map((goal) => (
              <span key={goal} className={styles.goalBadge}>
                {goal}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ProfilePage;
