import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { NAV_TABS } from './constants';
import styles from './GymLayout.module.css';

function GymLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const isNewWorkout = location.pathname === ROUTES.NEW_WORKOUT;

  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast);
      const { toast: _toast, ...restState } = location.state;
      navigate(location.pathname, { replace: true, state: restState });
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <Link to={ROUTES.HOME} className={styles.logo}>
          <div className={styles.logoIcon}>🏋️</div>
          <div>
            <div className={styles.logoText}>GymTracker</div>
            <div className={styles.logoSub}>Учет результатов</div>
          </div>
        </Link>
        <Link to={ROUTES.NEW_WORKOUT} className={styles.btnPrimary}>
          + Добавить тренировку
        </Link>
      </header>

      {!isNewWorkout && (
        <nav className={styles.nav}>
          {NAV_TABS.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === ROUTES.HOME}
              className={({ isActive }) =>
                `${styles.navTab} ${isActive ? styles.navTabActive : ''}`
              }
            >
              {tab.icon} {tab.label}
            </NavLink>
          ))}
        </nav>
      )}

      <Outlet />

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

export default GymLayout;
