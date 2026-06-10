import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import ActiveWorkoutBanner from '../../../features/activeWorkout/ActiveWorkoutBanner/ActiveWorkoutBanner';
import ProfileAvatar from '../../../features/profile/ProfileAvatar/ProfileAvatar';
import { useProfile } from '../../../features/profile/useProfile';
import { authStore } from '../../stores/authStore';
import { activeWorkoutStore } from '../../stores/activeWorkoutStore';
import { NAV_TABS } from './constants';
import styles from './GymLayout.module.css';

const GymLayout = observer(function GymLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const { profile } = useProfile();
  const isProfileEdit = location.pathname === ROUTES.PROFILE_EDIT;
  const isProfile = location.pathname === ROUTES.PROFILE;
  const isActiveWorkout = location.pathname === ROUTES.ACTIVE_WORKOUT;
  const hideNav = isProfileEdit || isProfile;
  const profileLabel = profile?.name?.split(' ')[0] ?? 'Профиль';
  const showWorkoutBanner = activeWorkoutStore.isActive && !isActiveWorkout;
  const isAuthReady = authStore.isInitialized && authStore.isAuthenticated;

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    activeWorkoutStore.ensureHydrated();
  }, [isAuthReady]);

  useEffect(() => {
    if (!location.state?.toast) {
      return;
    }

    setToast(location.state.toast);
    const { toast: _toast, ...restState } = location.state;
    navigate(location.pathname, { replace: true, state: restState });
  }, [location.key, location.pathname, location.state?.toast, navigate]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={`${styles.shell} ${styles.headerInner}`}>
          <Link to={ROUTES.HOME} className={styles.logo}>
            <div className={styles.logoIcon}>🏋️</div>
            <div>
              <div className={styles.logoText}>GymTracker</div>
              <div className={styles.logoSub}>Учет результатов</div>
            </div>
          </Link>

          <NavLink
            to={ROUTES.PROFILE}
            className={({ isActive }) =>
              `${styles.profileBtn} ${isActive ? styles.profileBtnActive : ''}`
            }
            title={profile?.name ?? 'Профиль'}
          >
            <ProfileAvatar variant="header" />
            <span className={styles.profileBtnLabel}>{profileLabel}</span>
          </NavLink>
        </div>
      </header>

      {showWorkoutBanner && (
        <div className={styles.workoutStrip}>
          <div className={styles.shell}>
            <ActiveWorkoutBanner />
          </div>
        </div>
      )}

      {!hideNav && (
        <nav className={styles.nav}>
          <div className={`${styles.shell} ${styles.navInner}`}>
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
          </div>
        </nav>
      )}

      <main className={`${styles.shell} ${styles.content}`}>
        <Outlet />
      </main>

      {toast && (
        <div className={styles.toast} role="status">
          <span className={styles.toastMessage}>{toast}</span>
          <button
            type="button"
            className={styles.toastClose}
            onClick={() => setToast(null)}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
});

export default GymLayout;
