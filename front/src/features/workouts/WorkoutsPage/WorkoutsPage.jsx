import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { SAMPLE_WORKOUTS } from '../constants';
import styles from './WorkoutsPage.module.css';

function WorkoutsPage() {
  const location = useLocation();
  const [workouts, setWorkouts] = useState(SAMPLE_WORKOUTS);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date');

  useEffect(() => {
    const savedWorkout = location.state?.savedWorkout;
    if (!savedWorkout) return;

    setWorkouts((prev) =>
      prev.some((workout) => workout.id === savedWorkout.id)
        ? prev
        : [savedWorkout, ...prev],
    );
  }, [location.state?.savedWorkout]);

  const filtered = workouts
    .filter(
      (workout) =>
        search === '' ||
        workout.exercises.some((exercise) =>
          exercise.name.toLowerCase().includes(search.toLowerCase()),
        ),
    )
    .sort((a, b) =>
      sort === 'date' ? new Date(b.date) - new Date(a.date) : b.duration - a.duration,
    );

  return (
    <div className={styles.main}>
      <div className={styles.pageTitle}>Мои тренировки</div>
      <div className={styles.pageSub}>История всех тренировок ({workouts.length})</div>

      <div className={styles.searchRow}>
        <input
          className={styles.searchBar}
          placeholder="🔍  Поиск по упражнениям..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="date">По дате</option>
          <option value="duration">По длительности</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>📋</div>
          <div className={styles.emptyTitle}>У вас пока нет тренировок</div>
          <div className={styles.emptyDesc}>Добавьте первую тренировку</div>
          <Link to={ROUTES.NEW_WORKOUT} className={styles.btnPrimary}>
            + Добавить тренировку
          </Link>
        </div>
      ) : (
        filtered.map((workout) => {
          const exerciseNames = workout.exercises.map((exercise) => exercise.name).join(', ');
          const truncatedNames =
            exerciseNames.slice(0, 50) + (exerciseNames.length > 50 ? '...' : '');

          return (
            <div className={styles.workoutCard} key={workout.id}>
              <div>
                <div className={styles.workoutDate}>
                  {new Date(workout.date).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <div className={styles.workoutName}>{truncatedNames}</div>
                <div className={styles.workoutExercises}>
                  {workout.exercises.length} упражнений ·{' '}
                  {workout.exercises.reduce((sum, exercise) => sum + exercise.sets, 0)} подходов
                </div>
              </div>
              <div className={styles.workoutMeta}>
                <div className={styles.workoutBadge}>{workout.duration} мин</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default WorkoutsPage;
