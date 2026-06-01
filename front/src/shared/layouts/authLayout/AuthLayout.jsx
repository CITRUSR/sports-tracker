import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

function AuthLayout() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.banner} />
        <div className={styles.content}>
          <div className={styles.brand}>
            <span className={styles.logo}>Sports-tracker</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
