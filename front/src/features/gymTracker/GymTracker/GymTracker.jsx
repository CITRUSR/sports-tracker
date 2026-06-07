import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import pageStyles from '../../../shared/layouts/gymLayout/gymPage.module.css';
import StatCard from '../StatCard/StatCard';
import { useStatistics } from '../useStatistics';
import styles from './GymTracker.module.css';

function GymTracker() {
  const { statistics, isLoading, error } = useStatistics();
  const {
    workoutsCount,
    exercisesCount,
    totalVolume,
    averageDurationMinutes,
    favoriteExercise,
  } = statistics;

  return (
    <>
      <div className={pageStyles.pageTitle}>Добро пожаловать! 👋</div>
      <div className={pageStyles.pageSub}>Отслеживайте свой прогресс и достигайте новых высот</div>

      {isLoading && <div className={pageStyles.pageStatus}>Загрузка...</div>}
      {error && <div className={pageStyles.pageError}>{error}</div>}

      <div className={styles.statsGrid}>
        <StatCard label="Всего тренировок" value={workoutsCount} icon="📅" iconBg="#EEF1FF" />
        <StatCard label="Упражнений выполнено" value={exercisesCount} icon="⚡" iconBg="#ECFDF5" />
        <StatCard label="Общий объём" value={`${totalVolume} кг`} icon="📈" iconBg="#F5F0FF" />
        <StatCard
          label="Средняя длительность"
          value={`${averageDurationMinutes} мин`}
          icon="⏱"
          iconBg="#FFF7ED"
        />
      </div>

      <div className={styles.favBanner}>
        <div className={styles.favIcon}>🏆</div>
        <div>
          <div className={styles.favLabel}>Ваше любимое упражнение</div>
          <div className={styles.favVal}>{favoriteExercise || 'Нет данных'}</div>
        </div>
      </div>

      <div className={styles.actionGrid}>
        <div className={styles.actionCard}>
          <div className={styles.actionIcon}>🏋️</div>
          <div className={styles.actionTitle}>Новая тренировка</div>
          <div className={styles.actionDesc}>
            Начните записывать новую тренировку и отслеживайте прогресс
          </div>
          <Link to={ROUTES.NEW_WORKOUT} className={`${styles.btnPrimary} ${styles.btnPrimaryFull}`}>
            Начать тренировку
          </Link>
        </div>
        <div className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles.actionIconPurple}`}>📊</div>
          <div className={styles.actionTitle}>Прогресс</div>
          <div className={styles.actionDesc}>
            Просматривайте детальную статистику по каждому упражнению
          </div>
          <Link to={ROUTES.PROGRESS} className={`${styles.btnOutline} ${styles.btnOutlineFull}`}>
            Посмотреть прогресс
          </Link>
        </div>
      </div>

      {!isLoading && workoutsCount === 0 && (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>🏋️</div>
          <div className={styles.emptyTitle}>Начните свой путь</div>
          <div className={styles.emptyDesc}>
            Добавьте первую тренировку, чтобы начать отслеживать прогресс
          </div>
          <Link to={ROUTES.NEW_WORKOUT} className={styles.btnPrimary}>
            Добавить первую тренировку
          </Link>
        </div>
      )}
    </>
  );
}

export default GymTracker;
