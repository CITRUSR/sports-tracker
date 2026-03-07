import styles from './DefaultLayout.module.css';

function DefaultLayout({ children }) {
  return <div className={styles.container}>{children}</div>;
}

export default DefaultLayout;
