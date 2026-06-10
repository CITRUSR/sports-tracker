import styles from './ProfileAvatar.module.css';

function ProfileAvatar({ variant = 'hero' }) {
  const isHeader = variant === 'header';

  return (
    <div
      className={`${styles.avatar} ${isHeader ? styles.avatarHeader : ''}`}
      aria-hidden="true"
    >
      <svg
        className={`${styles.icon} ${isHeader ? styles.iconHeader : ''}`}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="40" cy="30" r="14" fill="currentColor" />
        <path d="M16 68c4-14 14-22 24-22s20 8 24 22" fill="currentColor" />
      </svg>
    </div>
  );
}

export default ProfileAvatar;
