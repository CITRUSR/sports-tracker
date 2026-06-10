import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { activeWorkoutStore } from '../../../shared/stores/activeWorkoutStore';
import { formatElapsed } from '../activeWorkoutUtils';
import styles from './ActiveWorkoutBanner.module.css';

const ActiveWorkoutBanner = observer(function ActiveWorkoutBanner() {
  const { isActive, elapsed, running } = activeWorkoutStore;

  if (!isActive) {
    return null;
  }

  return (
    <Link to={ROUTES.ACTIVE_WORKOUT} className={styles.banner}>
      <div className={styles.left}>
        <span className={styles.icon}>{running ? '⏱' : '⏸'}</span>
        <span className={styles.text}>
          {running ? 'Тренировка идёт' : 'Тренировка на паузе'}
        </span>
      </div>
      <span className={styles.timer}>{formatElapsed(elapsed)}</span>
      <span className={styles.chevron} aria-hidden="true">
        →
      </span>
    </Link>
  );
});

export default ActiveWorkoutBanner;
