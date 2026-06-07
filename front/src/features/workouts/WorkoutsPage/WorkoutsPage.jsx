import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import pageStyles from '../../../shared/layouts/gymLayout/gymPage.module.css';
import {
  formatWorkoutDate,
  getWorkoutDurationLabel,
  getWorkoutExerciseNames,
} from '../workoutDisplayUtils';
import { useWorkoutsPage } from '../useWorkoutsPage';
import styles from './WorkoutsPage.module.css';

function WorkoutsPage() {
  const {
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    exerciseId,
    setExerciseId,
    exercises,
    completedWorkouts,
    hasActiveWorkout,
    isLoading,
    error,
  } = useWorkoutsPage();

  return (
    <>
      <div className={pageStyles.pageTitle}>Мои тренировки</div>
      <div className={pageStyles.pageSub}>
        Найдено тренировок: {isLoading ? '...' : completedWorkouts.length}
      </div>

      {error && <div className={pageStyles.pageError}>{error}</div>}

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="date-from">
            Дата от
          </label>
          <input
            id="date-from"
            type="date"
            className={styles.filterInput}
            value={dateFrom}
            max={dateTo}
            onChange={(event) => setDateFrom(event.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="date-to">
            Дата до
          </label>
          <input
            id="date-to"
            type="date"
            className={styles.filterInput}
            value={dateTo}
            min={dateFrom}
            onChange={(event) => setDateTo(event.target.value)}
          />
        </div>
        <div className={`${styles.filterGroup} ${styles.filterGroupWide}`}>
          <label className={styles.filterLabel} htmlFor="exercise-filter">
            Упражнение
          </label>
          <select
            id="exercise-filter"
            className={styles.filterInput}
            value={exerciseId}
            onChange={(event) => setExerciseId(event.target.value)}
          >
            <option value="">Все упражнения</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className={pageStyles.pageStatus}>Загрузка...</div>
      ) : completedWorkouts.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>📋</div>
          <div className={styles.emptyTitle}>У вас пока нет тренировок</div>
          <div className={styles.emptyDesc}>Добавьте первую тренировку</div>
          <Link to={ROUTES.NEW_WORKOUT} className={styles.btnPrimary}>
            + Добавить тренировку
          </Link>
        </div>
      ) : (
        <>
          {hasActiveWorkout && (
            <div className={styles.activeBanner}>
              <span>🏋️ У вас есть активная тренировка</span>
              <span className={styles.activeBadge}>В процессе</span>
            </div>
          )}

          {completedWorkouts.map((workout) => (
            <div className={styles.workoutCard} key={workout.id}>
              <div className={styles.workoutInfo}>
                <div className={styles.workoutDate}>{formatWorkoutDate(workout.date)}</div>
                <div className={styles.workoutName}>{getWorkoutExerciseNames(workout)}</div>
                {workout.comment && (
                  <div className={styles.workoutExercises}>{workout.comment}</div>
                )}
              </div>
              <div className={styles.workoutMeta}>
                <div className={styles.workoutBadge}>{getWorkoutDurationLabel(workout)}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}

export default WorkoutsPage;
