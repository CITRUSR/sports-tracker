import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import Button from '../../shared/components/button/Button';
import styles from './NotFoundPage.module.css';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Страница не найдена</h1>
      <p className={styles.subtitle}>
        Такой страницы не существует или она была удалена.
      </p>
      <Button onClick={() => navigate(ROUTES.HOME)}>На главную</Button>
    </div>
  );
}

export default NotFoundPage;
