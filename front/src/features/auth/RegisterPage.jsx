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

function RegisterPage() {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.register({ login, password, confirmPassword });
      navigate('/login');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Create account</h1>
      <p className={styles.subtitle}>Start tracking your workouts today.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          id="login"
          label="Login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Choose a login"
          autoComplete="username"
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          autoComplete="new-password"
          required
        />
        <Input
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
        />

        {error && <p className={styles.formError}>{error}</p>}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link className={styles.link} to="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
