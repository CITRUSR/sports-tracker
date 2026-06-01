import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../shared/components/button/Button';
import Input from '../../shared/components/input/Input';
import api from '../api/api';
import styles from './AuthPage.module.css';

function getErrorMessage(error) {
  const data = error?.response?.data;
  if (Array.isArray(data)) return data.join(', ');
  if (typeof data === 'string') return data;
  return 'Something went wrong. Please try again.';
}

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
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Sign in</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          id="login"
          label="Login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Enter your login"
          autoComplete="username"
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        {error && <p className={styles.formError}>{error}</p>}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className={styles.footer}>
        Don&apos;t have an account?{' '}
        <Link className={styles.link} to="/register">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
