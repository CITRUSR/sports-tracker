import StatCard from '../StatCard/StatCard';
import styles from './DashboardTab.module.css';

function DashboardTab({ statistics, onStart, onProgress }) {
  const {
    workoutsCount,
    exercisesCount,
    totalVolume,
    averageDurationMinutes,
    favoriteExercise,
  } = statistics;

  return (
    <div className={styles.main}>
      <div className={styles.pageTitle}>Добро пожаловать! 👋</div>
      <div className={styles.pageSub}>Отслеживайте свой прогресс и достигайте новых высот</div>

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
          <button
            type="button"
            className={`${styles.btnPrimary} ${styles.btnPrimaryFull}`}
            onClick={onStart}
          >
            Начать тренировку
          </button>
        </div>
        <div className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles.actionIconPurple}`}>📊</div>
          <div className={styles.actionTitle}>Прогресс</div>
          <div className={styles.actionDesc}>
            Просматривайте детальную статистику по каждому упражнению
          </div>
          <button
            type="button"
            className={`${styles.btnOutline} ${styles.btnOutlineFull}`}
            onClick={onProgress}
          >
            Посмотреть прогресс
          </button>
        </div>
      </div>

      {workoutsCount === 0 && (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>🏋️</div>
          <div className={styles.emptyTitle}>Начните свой путь</div>
          <div className={styles.emptyDesc}>
            Добавьте первую тренировку, чтобы начать отслеживать прогресс
          </div>
          <button type="button" className={styles.btnPrimary} onClick={onStart}>
            Добавить первую тренировку
          </button>
        </div>
      )}
    </div>
  );
}

export default DashboardTab;
