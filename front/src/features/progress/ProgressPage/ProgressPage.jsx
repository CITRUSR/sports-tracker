import { useEffect, useState } from 'react';
import pageStyles from '../../../shared/layouts/gymLayout/gymPage.module.css';
import styles from './ProgressPage.module.css';

function ProgressPage({ exerciseNames = [], chartDataByExercise = {} }) {
  const [selected, setSelected] = useState(exerciseNames[0] || null);

  useEffect(() => {
    if (exerciseNames.length && !selected) {
      setSelected(exerciseNames[0]);
    }
  }, [exerciseNames]);

  const chartData = selected ? chartDataByExercise[selected] ?? [] : [];
  const maxVolume = chartData.length ? Math.max(...chartData.map((item) => item.volume)) : 1;

  return (
    <>
      <div className={pageStyles.pageTitle}>Прогресс 📈</div>
      <div className={pageStyles.pageSub}>Отслеживайте прогресс по каждому упражнению</div>

      {exerciseNames.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>📊</div>
          <div className={styles.emptyTitle}>Нет данных</div>
          <div className={styles.emptyDesc}>
            Добавьте тренировки, чтобы увидеть графики прогресса
          </div>
        </div>
      ) : (
        <div className={styles.progressCard}>
          <div className={styles.sectionTitle}>Выберите упражнение</div>
          <div className={styles.exSelector}>
            {exerciseNames.map((name) => (
              <button
                key={name}
                type="button"
                className={`${styles.exChip} ${selected === name ? styles.exChipActive : ''}`}
                onClick={() => setSelected(name)}
              >
                {name}
              </button>
            ))}
          </div>

          {chartData.length > 0 ? (
            <>
              <div className={styles.chartLabel}>Объём (кг × повторения × подходы)</div>
              <div className={styles.chartScroll}>
                <div className={styles.chartWrap}>
                  {chartData.map((item, index) => (
                    <div className={styles.chartBarGroup} key={index}>
                      <div className={styles.chartBarVal}>{item.volume}</div>
                      <div
                        className={styles.chartBar}
                        style={{ height: `${(item.volume / maxVolume) * 160}px` }}
                      />
                      <div className={styles.chartBarLabel}>{item.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.noChartData}>Нет данных для этого упражнения</div>
          )}
        </div>
      )}
    </>
  );
}

export default ProgressPage;
