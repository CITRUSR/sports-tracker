import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../shared/components/button/Button';
import Input from '../../shared/components/input/Input';
import api from '../api/api';
import { getAuthErrorMessage } from './getAuthErrorMessage';
import styles from './AuthPage.module.css';

function LoginPage() {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await api.login({ login, password });
      navigate('/');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Вход</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          id="login"
          label="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Введите логин"
          autoComplete="username"
          required
        />
        <Input
          id="password"
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введите пароль"
          autoComplete="current-password"
          required
        />

        {error && <p className={styles.formError}>{error}</p>}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Вход...' : 'Войти'}
        </Button>
      </form>

      <p className={styles.footer}>
        Нет аккаунта?{' '}
        <Link className={styles.link} to="/register">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
