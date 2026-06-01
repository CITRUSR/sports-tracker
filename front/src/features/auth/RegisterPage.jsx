import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import Button from '../../shared/components/button/Button';
import Input from '../../shared/components/input/Input';
import PasswordInput from '../../shared/components/passwordInput/PasswordInput';
import api from '../api/api';
import { getAuthErrorMessage } from './getAuthErrorMessage';
import {
  getPasswordValidationError,
  PASSWORD_REQUIREMENTS_HINT,
} from './passwordValidation';
import styles from './AuthPage.module.css';

function RegisterPage() {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordBlur = () => {
    if (!password) {
      setPasswordError('');
      return;
    }
    setPasswordError(getPasswordValidationError(password));
  };

  const handleConfirmPasswordBlur = () => {
    if (!confirmPassword) {
      setConfirmPasswordError('');
      return;
    }
    setConfirmPasswordError(
      password !== confirmPassword ? 'Пароли не совпадают' : ''
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const passwordValidationError = getPasswordValidationError(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Пароли не совпадают');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.register({ login, password, confirmPassword });
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Регистрация</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          id="login"
          label="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Придумайте логин"
          autoComplete="username"
          required
        />
        <div>
          <PasswordInput
            id="password"
            label="Пароль"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            onBlur={handlePasswordBlur}
            placeholder="Придумайте пароль"
            autoComplete="new-password"
            error={passwordError}
            required
          />
          {!passwordError && (
            <p className={styles.hint}>{PASSWORD_REQUIREMENTS_HINT}</p>
          )}
        </div>
        <PasswordInput
          id="confirmPassword"
          label="Подтверждение пароля"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (confirmPasswordError) setConfirmPasswordError('');
          }}
          onBlur={handleConfirmPasswordBlur}
          placeholder="Повторите пароль"
          autoComplete="new-password"
          error={confirmPasswordError}
          required
        />

        {error && <p className={styles.formError}>{error}</p>}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Создание аккаунта...' : 'Создать аккаунт'}
        </Button>
      </form>

      <p className={styles.footer}>
        Уже есть аккаунт?{' '}
        <Link className={styles.link} to={ROUTES.LOGIN}>
          Войти
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
