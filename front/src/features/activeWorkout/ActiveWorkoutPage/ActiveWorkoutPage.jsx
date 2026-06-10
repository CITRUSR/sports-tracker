import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import pageStyles from '../../../shared/layouts/gymLayout/gymPage.module.css';
import { activeWorkoutStore } from '../../../shared/stores/activeWorkoutStore';
import formStyles from '../../workouts/WorkoutEntryPage/WorkoutEntryPage.module.css';
import { formatElapsed, formatWorkoutDateRu, getTodayDateString } from '../activeWorkoutUtils';
import styles from './ActiveWorkoutPage.module.css';

const ActiveWorkoutPage = observer(function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const {
    isActive,
    elapsed,
    running,
    notes,
    exercises,
    togglePause,
    setNotes,
    addExercise,
    removeExercise,
    updateExercise,
    finishWorkout,
    cancelWorkout,
  } = activeWorkoutStore;
  const todayLabel = formatWorkoutDateRu(getTodayDateString());

  useEffect(() => {
    if (!isActive) {
      navigate(ROUTES.NEW_WORKOUT, { replace: true });
    }
  }, [isActive, navigate]);

  if (!isActive) {
    return null;
  }

  const validate = () => {
    const nextErrors = {};
    let isValid = true;

    exercises.forEach((exercise) => {
      const exerciseErrors = {};

      if (!exercise.name.trim()) {
        exerciseErrors.name = 'Введите название упражнения';
        isValid = false;
      }

      if (!exercise.sets || exercise.sets < 1) {
        exerciseErrors.sets = 'Мин. 1';
        isValid = false;
      }

      if (!exercise.reps || exercise.reps < 1) {
        exerciseErrors.reps = 'Мин. 1';
        isValid = false;
      }

      if (exercise.weight == null || exercise.weight < 0) {
        exerciseErrors.weight = '≥ 0';
        isValid = false;
      }

      if (Object.keys(exerciseErrors).length) {
        nextErrors[exercise.id] = exerciseErrors;
      }
    });

    setErrors(nextErrors);
    return isValid;
  };

  const handleFinish = () => {
    if (!validate()) {
      return;
    }

    finishWorkout();
    navigate(ROUTES.WORKOUTS, { state: { toast: '✅ Тренировка сохранена!' } });
  };

  const handleCancel = () => {
    if (window.confirm('Отменить тренировку? Все несохранённые данные будут потеряны.')) {
      cancelWorkout();
      navigate(ROUTES.WORKOUTS);
    }
  };

  const renderField = (label, error, input) => (
    <div className={styles.formField}>
      <label className={formStyles.formLabel}>{label}</label>
      {input}
      <span className={`${styles.errorSlot} ${error ? styles.errorSlotVisible : ''}`}>
        {error || '\u00a0'}
      </span>
    </div>
  );

  return (
    <>
      <div className={styles.timerStrip}>
        <div className={styles.timerBar}>
          <div>
            <div className={styles.timerLabel}>{running ? 'Тренировка идёт' : 'Пауза'}</div>
            <div
              className={`${styles.timerDisplay} ${running ? styles.timerPulse : styles.timerDisplayPaused}`}
            >
              {formatElapsed(elapsed)}
            </div>
          </div>
          <div className={styles.timerControls}>
            <button type="button" className={styles.btnTimerPause} onClick={togglePause}>
              {running ? '⏸ Пауза' : '▶ Продолжить'}
            </button>
            <button type="button" className={styles.btnTimerFinish} onClick={handleFinish}>
              ✅ Завершить
            </button>
          </div>
        </div>
      </div>

      <div className={pageStyles.pageTitle}>Активная тренировка</div>
      <div className={`${pageStyles.pageSub} ${pageStyles.pageSubCompact}`}>
        Таймер продолжает идти при переключении страниц
      </div>

      <div className={formStyles.formCard}>
        <div className={formStyles.formSectionTitle}>Основная информация</div>
        <div className={`${formStyles.formGroup} ${formStyles.formGroupInline}`}>
          <span className={formStyles.formLabel}>Дата тренировки</span>
          <div className={styles.dateValue}>{todayLabel}</div>
        </div>
      </div>

      <div className={formStyles.formCard}>
        <div className={formStyles.formCardHeader}>
          <div className={`${formStyles.formSectionTitle} ${formStyles.formSectionTitleInline}`}>
            Упражнения
          </div>
          <button
            type="button"
            className={`${formStyles.btnPrimary} ${formStyles.btnPrimarySmall}`}
            onClick={addExercise}
          >
            + Добавить упражнение
          </button>
        </div>

        {exercises.map((exercise, index) => {
          const exerciseErrors = errors[exercise.id] || {};
          const hasError = Object.keys(exerciseErrors).length > 0;

          return (
            <div
              className={`${formStyles.exerciseCard} ${hasError ? styles.exerciseCardError : ''}`}
              key={exercise.id}
            >
              <div className={formStyles.exerciseHeader}>
                <div className={formStyles.exerciseLabel}>Упражнение {index + 1}</div>
                {exercises.length > 1 && (
                  <button
                    type="button"
                    className={formStyles.btnDanger}
                    onClick={() => removeExercise(exercise.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className={styles.exerciseGrid}>
                {renderField(
                  'Название',
                  exerciseErrors.name,
                  <input
                    className={`${formStyles.formInput} ${exerciseErrors.name ? styles.formInputError : ''}`}
                    placeholder="Например, Жим штанги"
                    value={exercise.name}
                    onChange={(event) => updateExercise(exercise.id, 'name', event.target.value)}
                  />,
                )}
                {renderField(
                  'Подходы',
                  exerciseErrors.sets,
                  <input
                    type="number"
                    className={`${formStyles.formInput} ${exerciseErrors.sets ? styles.formInputError : ''}`}
                    value={exercise.sets}
                    onChange={(event) =>
                      updateExercise(exercise.id, 'sets', Number(event.target.value))
                    }
                    min={1}
                  />,
                )}
                {renderField(
                  'Повторения',
                  exerciseErrors.reps,
                  <input
                    type="number"
                    className={`${formStyles.formInput} ${exerciseErrors.reps ? styles.formInputError : ''}`}
                    value={exercise.reps}
                    onChange={(event) =>
                      updateExercise(exercise.id, 'reps', Number(event.target.value))
                    }
                    min={1}
                  />,
                )}
                {renderField(
                  'Вес (кг)',
                  exerciseErrors.weight,
                  <input
                    type="number"
                    className={`${formStyles.formInput} ${exerciseErrors.weight ? styles.formInputError : ''}`}
                    value={exercise.weight}
                    onChange={(event) =>
                      updateExercise(exercise.id, 'weight', Number(event.target.value))
                    }
                    min={0}
                    step={0.5}
                  />,
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={formStyles.formCard}>
        <div className={formStyles.formSectionTitle}>Заметки (необязательно)</div>
        <textarea
          className={`${formStyles.formInput} ${formStyles.formTextarea}`}
          placeholder="Добавьте заметки о тренировке..."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      <div className={formStyles.formActions}>
        <button
          type="button"
          className={`${formStyles.btnPrimary} ${formStyles.btnPrimaryLarge}`}
          onClick={handleFinish}
        >
          ✅ Завершить тренировку
        </button>
        <button
          type="button"
          className={`${formStyles.btnOutline} ${formStyles.btnOutlineLarge}`}
          onClick={handleCancel}
        >
          Отмена
        </button>
      </div>
    </>
  );
});

export default ActiveWorkoutPage;
