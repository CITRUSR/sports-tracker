import { useState } from 'react';
import inputStyles from '../input/Input.module.css';
import styles from './PasswordInput.module.css';

function EyeIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M1 1l22 22" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  autoComplete,
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={inputStyles.field}>
      {label && (
        <label className={inputStyles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <div className={styles.wrapper}>
        <input
          id={id}
          className={`${inputStyles.input} ${styles.input} ${error ? inputStyles.inputError : ''}`}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setIsVisible((prev) => !prev)}
          aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <span className={inputStyles.error}>{error}</span>}
    </div>
  );
}

export default PasswordInput;
