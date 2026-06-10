import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import pageStyles from '../../../shared/layouts/gymLayout/gymPage.module.css';
import formStyles from '../WorkoutEntryPage/WorkoutEntryPage.module.css';
import {
  formatWorkoutDate,
  formatWorkoutTime,
  getWorkoutDurationLabel,
  getWorkoutExerciseNames,
  getWorkoutTotalSets,
  getWorkoutTotalVolume,
  groupWorkoutExercises,
} from '../workoutDisplayUtils';
import { useWorkoutDetail } from '../useWorkoutDetail';
import styles from './WorkoutDetailPage.module.css';

function WorkoutDetailPage() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { workout, isLoading, error } = useWorkoutDetail(workoutId);

  if (isLoading) {
    return <div className={pageStyles.pageStatus}>Загрузка тренировки...</div>;
  }

  if (error || !workout) {
    return (
      <>
        <button type="button" className={formStyles.backBtn} onClick={() => navigate(ROUTES.WORKOUTS)}>
          ← Назад к списку
        </button>
        <div className={pageStyles.pageError}>{error || 'Тренировка не найдена'}</div>
      </>
    );
  }

  const exerciseGroups = groupWorkoutExercises(workout.exercises);
  const totalSets = getWorkoutTotalSets(workout.exercises);
  const totalVolume = getWorkoutTotalVolume(workout.exercises);
  const pauseCount = workout.pauses?.length ?? 0;

  return (
    <>
      <button type="button" className={formStyles.backBtn} onClick={() => navigate(ROUTES.WORKOUTS)}>
        ← Назад к списку
      </button>

      <div className={pageStyles.pageTitle}>{formatWorkoutDate(workout.date)}</div>
      <div className={pageStyles.pageSub}>{getWorkoutExerciseNames(workout)}</div>

      <div className={formStyles.infoCard}>
        <div className={formStyles.infoItem}>
          <div className={formStyles.infoIcon}>⏱️</div>
          <div>
            <div className={formStyles.infoTitle}>Сводка</div>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Длительность</div>
                <div className={styles.summaryValue}>{getWorkoutDurationLabel(workout)}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Время</div>
                <div className={styles.summaryValue}>
                  {formatWorkoutTime(workout.timeStart)} — {formatWorkoutTime(workout.timeEnd)}
                </div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Подходы</div>
                <div className={styles.summaryValue}>{totalSets}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Объём</div>
                <div className={styles.summaryValue}>{totalVolume} кг</div>
              </div>
              {pauseCount > 0 && (
                <div className={styles.summaryItem}>
                  <div className={styles.summaryLabel}>Паузы</div>
                  <div className={styles.summaryValue}>{pauseCount}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {workout.comment && (
        <div className={styles.notesCard}>
          <div className={styles.sectionTitle}>Заметки</div>
          <div className={styles.notesText}>{workout.comment}</div>
        </div>
      )}

      <div className={styles.sectionTitle}>Упражнения</div>

      {exerciseGroups.length === 0 ? (
        <div className={pageStyles.pageStatus}>Упражнения не записаны</div>
      ) : (
        exerciseGroups.map((exercise) => (
          <div
            className={styles.exerciseCard}
            key={`${exercise.name}-${exercise.weight}-${exercise.reps}`}
          >
            <div className={styles.exerciseName}>{exercise.name}</div>
            <div className={styles.exerciseMeta}>
              <span className={styles.exerciseBadge}>{exercise.sets} подх.</span>
              <span className={styles.exerciseBadge}>{exercise.reps} повт.</span>
              <span className={styles.exerciseBadge}>{exercise.weight} кг</span>
            </div>
          </div>
        ))
      )}
    </>
  );
}

export default WorkoutDetailPage;
