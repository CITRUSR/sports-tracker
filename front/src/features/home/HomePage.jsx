import { useEffect, useState } from 'react';
import styles from './HomePage.module.css';
import api from '../api/api';

function HomePage() {
  const [backVersion, setBackVersion] = useState();

  useEffect(() => {
    api.healthCheck().then((response) => {
      console.log(response);
      setBackVersion(response);
    });
  }, []);

  return (
    <div className={styles.container}>
      Home test ci-cd back version: {backVersion}
    </div>
  );
}

export default HomePage;
