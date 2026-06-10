import { getExerciseEntryVolume } from '../../workouts/workoutStatsUtils';
import styles from './WorkoutMiniChart.module.css';

function WorkoutMiniChart({ workouts }) {
  const now = new Date();
  const weeks = Array.from({ length: 8 }, (_, index) => {
    const start = new Date(now);
    start.setDate(now.getDate() - 7 * (7 - index) - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const count = workouts.filter((workout) => {
      const date = new Date(`${workout.date}T12:00:00`);
      return date >= start && date < end;
    }).length;

    return { count };
  });
  const maxCount = Math.max(...weeks.map((week) => week.count), 1);

  const exerciseVolume = {};
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exerciseVolume[exercise.name] =
        (exerciseVolume[exercise.name] || 0) + getExerciseEntryVolume(exercise);
    });
  });
  const topExercises = Object.entries(exerciseVolume)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const maxVolume = topExercises[0]?.[1] || 1;

  if (workouts.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📊</div>
        <div className={styles.emptyText}>Добавьте тренировки, чтобы увидеть прогресс</div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.sectionTitle}>Активность по неделям</div>
      <div className={styles.weekBars}>
        {weeks.map((week, index) => (
          <div className={styles.weekBarGroup} key={index}>
            <div
              className={`${styles.weekBar} ${week.count > 0 ? styles.weekBarActive : styles.weekBarInactive}`}
              style={{
                height: week.count > 0 ? `${Math.max((week.count / maxCount) * 64, 8)}px` : undefined,
              }}
            />
          </div>
        ))}
      </div>

      {topExercises.length > 0 && (
        <>
          <div className={styles.topSectionTitle}>Топ упражнений</div>
          {topExercises.map(([name, volume]) => (
            <div className={styles.topRow} key={name}>
              <div className={styles.topRowHeader}>
                <span className={styles.topName}>{name}</span>
                <span className={styles.topVolume}>{volume} кг</span>
              </div>
              <div className={styles.topTrack}>
                <div
                  className={styles.topFill}
                  style={{ width: `${(volume / maxVolume) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default WorkoutMiniChart;
