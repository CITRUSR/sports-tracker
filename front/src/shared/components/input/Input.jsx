import styles from './Input.module.css';

function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  autoComplete,
}) {
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

export default Input;
