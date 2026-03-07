import { useEffect } from 'react';
import styles from './HomePage.module.css';
import api from '../api/api';

function HomePage() {
  useEffect(() => {
    api.healthCheck().then((response) => console.log(response));
  }, []);

  return <div className={styles.container}>Home test ci-cd</div>;
}

export default HomePage;
