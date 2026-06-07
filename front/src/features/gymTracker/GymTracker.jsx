import { useState } from 'react';
import { NAV_TABS, EMPTY_STATISTICS, SAMPLE_WORKOUTS } from './constants';
import styles from './GymTracker.module.css';
import NewWorkoutPage from '../newWorkout/NewWorkoutPage';
import DashboardTab from './DashboardTab/DashboardTab';
import ProgressTab from './ProgressTab/ProgressTab';
import WorkoutsTab from './WorkoutsTab/WorkoutsTab';

function GymTracker() {
  const [tab, setTab] = useState('home');
  const [view, setView] = useState('main');
  const [workouts, setWorkouts] = useState(SAMPLE_WORKOUTS);
  const [statistics] = useState(EMPTY_STATISTICS);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = (workout) => {
    setWorkouts((prev) => [workout, ...prev]);
    setView('main');
    setTab('workouts');
    showToast('✅ Тренировка сохранена!');
  };

  const openNewWorkout = () => {
    setView('new');
    setTab('home');
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🏋️</div>
          <div>
            <div className={styles.logoText}>GymTracker</div>
            <div className={styles.logoSub}>Учет результатов</div>
          </div>
        </div>
        <button type="button" className={styles.btnPrimary} onClick={openNewWorkout}>
          + Добавить тренировку
        </button>
      </header>

      {view === 'main' && (
        <nav className={styles.nav}>
          {NAV_TABS.map((navTab) => (
            <button
              key={navTab.id}
              type="button"
              className={`${styles.navTab} ${tab === navTab.id ? styles.navTabActive : ''}`}
              onClick={() => setTab(navTab.id)}
            >
              {navTab.icon} {navTab.label}
            </button>
          ))}
        </nav>
      )}

      {view === 'new' ? (
        <NewWorkoutPage onSave={handleSave} onCancel={() => setView('main')} />
      ) : tab === 'home' ? (
        <DashboardTab
          statistics={statistics}
          onStart={openNewWorkout}
          onProgress={() => setTab('progress')}
        />
      ) : tab === 'workouts' ? (
        <WorkoutsTab workouts={workouts} onAdd={openNewWorkout} />
      ) : (
        <ProgressTab />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

export default GymTracker;
