import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import pageStyles from '../../../shared/layouts/gymLayout/gymPage.module.css';
import { getDefaultDateFrom, getDefaultDateTo } from '../workoutUtils';
import styles from './WorkoutsPage.module.css';

function WorkoutsPage() {
  const [dateFrom, setDateFrom] = useState(getDefaultDateFrom);
  const [dateTo, setDateTo] = useState(getDefaultDateTo);
  const [exerciseId, setExerciseId] = useState('');

  return (
    <>
      <div className={pageStyles.pageTitle}>Мои тренировки</div>
      <div className={pageStyles.pageSub}>Найдено тренировок: 0</div>

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
          </select>
        </div>
      </div>

      <div className={styles.emptyCard}>
        <div className={styles.emptyIcon}>📋</div>
        <div className={styles.emptyTitle}>У вас пока нет тренировок</div>
        <div className={styles.emptyDesc}>Добавьте первую тренировку</div>
        <Link to={ROUTES.NEW_WORKOUT} className={styles.btnPrimary}>
          + Добавить тренировку
        </Link>
      </div>
    </>
  );
}

export default WorkoutsPage;
