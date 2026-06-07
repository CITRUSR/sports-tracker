import styles from './StatCard.module.css';

function StatCard({ label, value, icon, iconBg }) {
  return (
    <div className={styles.statCard}>
      <div>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statVal}>{value}</div>
      </div>
      <div className={styles.statIcon} style={{ background: iconBg }}>
        {icon}
      </div>
    </div>
  );
}

export default StatCard;
