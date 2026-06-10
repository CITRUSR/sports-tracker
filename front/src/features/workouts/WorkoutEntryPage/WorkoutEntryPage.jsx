import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import pageStyles from '../../../shared/layouts/gymLayout/gymPage.module.css';
import { useWorkoutEntry } from '../useWorkoutEntry';
import styles from './WorkoutEntryPage.module.css';

const createExerciseRow = () => ({
  id: Date.now(),
  exerciseId: '',
  sets: 3,
  reps: 10,
  weight: 0,
});

function WorkoutEntryPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState([createExerciseRow()]);
  const {
    exerciseOptions,
    isLoadingExercises,
    isSaving,
    error,
    beginWorkout,
    saveWorkout,
  } = useWorkoutEntry();

  const addExercise = () => {
    setExercises([...exercises, createExerciseRow()]);
  };

  const removeExercise = (id) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((exercise) => exercise.id !== id));
    }
  };

  const updateExercise = (id, field, value) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === id ? { ...exercise, [field]: value } : exercise,
      ),
    );
  };

  return (
    <>
      <button type="button" className={styles.backBtn} onClick={() => navigate(ROUTES.WORKOUTS)}>
        ← Назад
      </button>
      <div className={pageStyles.pageTitle}>Новая тренировка</div>
      <div className={`${pageStyles.pageSub} ${pageStyles.pageSubCompact}`}>
        Выберите, как хотите добавить тренировку
      </div>

      {error && <div className={pageStyles.pageError}>{error}</div>}

      <div className={styles.infoCard}>
        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>🏋️</div>
          <div>
            <div className={styles.infoTitle}>Новая тренировка</div>
            <div className={styles.infoText}>
              Ничего заранее указывать не нужно — начните тренировку, а упражнения, подходы
              и время будете фиксировать прямо в процессе.
            </div>
            <button type="button" className={styles.btnStartNow} onClick={beginWorkout}>
              Начать тренировку сейчас
            </button>
          </div>
        </div>
        <div className={styles.infoDivider} />
        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>📋</div>
          <div>
            <div className={styles.infoTitle}>Прошлая тренировка</div>
            <div className={styles.infoText}>
              Перенесите старые записи: сразу укажите дату, длительность, упражнения и
              результаты в форме ниже.
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formSectionTitle}>Перенос прошлой тренировки</div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="workout-date">
              Дата тренировки
            </label>
            <input
              id="workout-date"
              type="date"
              className={styles.formInput}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="workout-duration">
              Длительность (минуты)
            </label>
            <input
              id="workout-duration"
              type="number"
              className={styles.formInput}
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              min={1}
            />
          </div>
        </div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <div className={`${styles.formSectionTitle} ${styles.formSectionTitleInline}`}>
            Упражнения
          </div>
          <button
            type="button"
            className={`${styles.btnPrimary} ${styles.btnPrimarySmall}`}
            onClick={addExercise}
            disabled={isLoadingExercises}
          >
            + Добавить упражнение
          </button>
        </div>

        {isLoadingExercises ? (
          <div className={pageStyles.pageStatus}>Загрузка упражнений...</div>
        ) : (
          exercises.map((exercise, index) => (
            <div className={styles.exerciseCard} key={exercise.id}>
              <div className={styles.exerciseHeader}>
                <div className={styles.exerciseLabel}>Упражнение {index + 1}</div>
                {exercises.length > 1 && (
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => removeExercise(exercise.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className={styles.exerciseGrid}>
                <div className={`${styles.formGroup} ${styles.formGroupInline}`}>
                  <label className={styles.formLabel}>Упражнение</label>
                  <select
                    className={styles.formInput}
                    value={exercise.exerciseId}
                    onChange={(event) =>
                      updateExercise(exercise.id, 'exerciseId', event.target.value)
                    }
                  >
                    <option value="">Выберите упражнение</option>
                    {exerciseOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupInline}`}>
                  <label className={styles.formLabel}>Подходы</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={exercise.sets}
                    onChange={(event) =>
                      updateExercise(exercise.id, 'sets', Number(event.target.value))
                    }
                    min={1}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupInline}`}>
                  <label className={styles.formLabel}>Повторения</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={exercise.reps}
                    onChange={(event) =>
                      updateExercise(exercise.id, 'reps', Number(event.target.value))
                    }
                    min={1}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupInline}`}>
                  <label className={styles.formLabel}>Вес (кг)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={exercise.weight}
                    onChange={(event) =>
                      updateExercise(exercise.id, 'weight', Number(event.target.value))
                    }
                    min={1}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.formCard}>
        <div className={styles.formSectionTitle}>Заметки (необязательно)</div>
        <textarea
          className={`${styles.formInput} ${styles.formTextarea}`}
          placeholder="Добавьте заметки о тренировке..."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className={`${styles.btnPrimary} ${styles.btnPrimaryLarge}`}
          onClick={() => saveWorkout(exercises, notes)}
          disabled={isSaving || isLoadingExercises}
        >
          {isSaving ? 'Сохранение...' : '💾 Сохранить тренировку'}
        </button>
        <button
          type="button"
          className={`${styles.btnOutline} ${styles.btnOutlineLarge}`}
          onClick={() => navigate(ROUTES.WORKOUTS)}
          disabled={isSaving}
        >
          Отмена
        </button>
      </div>
    </>
  );
}

export default WorkoutEntryPage;
