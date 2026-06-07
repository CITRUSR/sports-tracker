import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import styles from './NewWorkoutPage.module.css';

function NewWorkoutPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState([
    { id: 1, name: '', sets: 3, reps: 10, weight: 0 },
  ]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      { id: Date.now(), name: '', sets: 3, reps: 10, weight: 0 },
    ]);
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

  const handleSave = () => {
    const validExercises = exercises.filter((exercise) => exercise.name.trim());
    if (!validExercises.length) {
      alert('Добавьте хотя бы одно упражнение с названием');
      return;
    }
    navigate(ROUTES.WORKOUTS, {
      state: {
        toast: '✅ Тренировка сохранена!',
        savedWorkout: {
          id: Date.now(),
          date,
          duration: Number(duration),
          notes,
          exercises: validExercises,
        },
      },
    });
  };

  return (
    <div className={styles.main}>
      <button type="button" className={styles.backBtn} onClick={() => navigate(ROUTES.WORKOUTS)}>
        ← Назад
      </button>
      <div className={styles.pageTitle}>Новая тренировка</div>
      <div className={`${styles.pageSub} ${styles.pageSubCompact}`}>
        Добавьте результаты тренировки
      </div>

      <div className={styles.formCard}>
        <div className={styles.formSectionTitle}>Основная информация</div>
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
          >
            + Добавить упражнение
          </button>
        </div>

        {exercises.map((exercise, index) => (
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
                <label className={styles.formLabel}>Название</label>
                <input
                  className={styles.formInput}
                  placeholder="Например, Жим штанги"
                  value={exercise.name}
                  onChange={(event) => updateExercise(exercise.id, 'name', event.target.value)}
                />
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
                  min={0}
                />
              </div>
            </div>
          </div>
        ))}
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
          onClick={handleSave}
        >
          💾 Сохранить тренировку
        </button>
        <button
          type="button"
          className={`${styles.btnOutline} ${styles.btnOutlineLarge}`}
          onClick={() => navigate(ROUTES.WORKOUTS)}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

export default NewWorkoutPage;
