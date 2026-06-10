import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import ExerciseSelect from '../../../shared/components/exerciseSelect/ExerciseSelect';
import NumberInput from '../../../shared/components/numberInput/NumberInput';
import pageStyles from '../../../shared/layouts/gymLayout/gymPage.module.css';
import { activeWorkoutStore } from '../../../shared/stores/activeWorkoutStore';
import formStyles from '../../workouts/WorkoutEntryPage/WorkoutEntryPage.module.css';
import { useExerciseOptions } from '../../workouts/useExerciseOptions';
import { validateExerciseRow } from '../activeWorkoutSync';
import { formatElapsed, formatWorkoutDateRu, getTodayDateString } from '../activeWorkoutUtils';
import styles from './ActiveWorkoutPage.module.css';

const ActiveWorkoutPage = observer(function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [pageError, setPageError] = useState('');
  const {
    isActive,
    isHydrating,
    isActionPending,
    syncError,
    elapsed,
    running,
    notes,
    exercises,
    draftExercise,
    togglePause,
    setNotes,
    beginDraftExercise,
    cancelDraftExercise,
    updateDraftExercise,
    updateExercise,
    saveDraftExercise,
    saveExercise,
    removeExercise,
    finishWorkout,
    cancelWorkout,
  } = activeWorkoutStore;
  const { exerciseOptions, isLoadingExercises } = useExerciseOptions();
  const todayLabel = formatWorkoutDateRu(getTodayDateString());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    activeWorkoutStore.ensureHydrated().then((hasActiveWorkout) => {
      if (isCancelled) {
        return;
      }

      setIsReady(true);

      if (!hasActiveWorkout) {
        navigate(ROUTES.NEW_WORKOUT, { replace: true });
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  if (!isReady || isHydrating) {
    return <div className={pageStyles.pageStatus}>Загрузка тренировки...</div>;
  }

  if (!isActive) {
    return null;
  }

  const validateRow = (row) => {
    const rowErrors = validateExerciseRow(row);
    setErrors((current) => ({ ...current, [row.clientKey]: rowErrors }));
    return Object.keys(rowErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!draftExercise || !validateRow(draftExercise)) {
      return;
    }

    setPageError('');

    try {
      await saveDraftExercise();
      setErrors({});
    } catch {
      setPageError(syncError || 'Не удалось сохранить упражнение');
    }
  };

  const handleSaveExercise = async (exercise) => {
    if (!validateRow(exercise)) {
      return;
    }

    setPageError('');

    try {
      await saveExercise(exercise.clientKey);
      setErrors((current) => {
        const next = { ...current };
        delete next[exercise.clientKey];
        return next;
      });
    } catch {
      setPageError(syncError || 'Не удалось обновить упражнение');
    }
  };

  const handleRemoveExercise = async (clientKey) => {
    if (!globalThis.confirm('Удалить упражнение из тренировки?')) {
      return;
    }

    setPageError('');

    try {
      await removeExercise(clientKey);
    } catch {
      setPageError(syncError || 'Не удалось удалить упражнение');
    }
  };

  const handleFinish = async () => {
    if (draftExercise) {
      setPageError('Сохраните или отмените добавляемое упражнение');
      return;
    }

    setPageError('');

    try {
      await finishWorkout();
      navigate(ROUTES.WORKOUTS, { state: { toast: '✅ Тренировка сохранена!' } });
    } catch {
      setPageError(syncError || 'Не удалось завершить тренировку');
    }
  };

  const handleCancel = async () => {
    if (!globalThis.confirm('Отменить тренировку? Все данные будут удалены.')) {
      return;
    }

    setPageError('');

    try {
      await cancelWorkout();
      navigate(ROUTES.WORKOUTS);
    } catch {
      setPageError(syncError || 'Не удалось отменить тренировку');
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

  const renderExerciseForm = (exercise, { isDraft, index }) => {
    const exerciseErrors = errors[exercise.clientKey] || {};
    const hasError = Object.keys(exerciseErrors).length > 0;
    const onChange = isDraft
      ? (field, value) => updateDraftExercise(field, value)
      : (field, value) => updateExercise(exercise.clientKey, field, value);

    return (
      <div
        className={`${formStyles.exerciseCard} ${hasError ? styles.exerciseCardError : ''}`}
        key={exercise.clientKey}
      >
        <div className={formStyles.exerciseHeader}>
          <div className={formStyles.exerciseLabel}>
            {isDraft ? 'Новое упражнение' : `Упражнение ${index + 1}`}
          </div>
          {!isDraft && (
            <button
              type="button"
              className={formStyles.btnDanger}
              onClick={() => handleRemoveExercise(exercise.clientKey)}
              disabled={isActionPending}
            >
              ✕
            </button>
          )}
        </div>
        <div className={styles.exerciseGrid}>
          {renderField(
            'Упражнение',
            exerciseErrors.exerciseId,
            <ExerciseSelect
              id={`active-exercise-${exercise.clientKey}`}
              exercises={exerciseOptions}
              value={exercise.exerciseId}
              onChange={(nextExerciseId) => onChange('exerciseId', nextExerciseId)}
              loading={isLoadingExercises}
              error={Boolean(exerciseErrors.exerciseId)}
            />,
          )}
          {renderField(
            'Подходы',
            exerciseErrors.sets,
            <NumberInput
              className={`${formStyles.formInput} ${exerciseErrors.sets ? styles.formInputError : ''}`}
              value={exercise.sets}
              onChange={(nextValue) => onChange('sets', nextValue)}
              min={1}
              disabled={isActionPending}
            />,
          )}
          {renderField(
            'Повторения',
            exerciseErrors.reps,
            <NumberInput
              className={`${formStyles.formInput} ${exerciseErrors.reps ? styles.formInputError : ''}`}
              value={exercise.reps}
              onChange={(nextValue) => onChange('reps', nextValue)}
              min={1}
              disabled={isActionPending}
            />,
          )}
          {renderField(
            'Вес (кг)',
            exerciseErrors.weight,
            <NumberInput
              className={`${formStyles.formInput} ${exerciseErrors.weight ? styles.formInputError : ''}`}
              value={exercise.weight}
              onChange={(nextValue) => onChange('weight', nextValue)}
              min={0}
              step={0.5}
              disabled={isActionPending}
            />,
          )}
        </div>
        <div className={styles.exerciseActions}>
          {isDraft ? (
            <>
              <button
                type="button"
                className={`${formStyles.btnPrimary} ${formStyles.btnPrimarySmall}`}
                onClick={handleSaveDraft}
                disabled={isActionPending || isLoadingExercises}
              >
                Сохранить
              </button>
              <button
                type="button"
                className={styles.btnOutlineSmall}
                onClick={cancelDraftExercise}
                disabled={isActionPending}
              >
                Отмена
              </button>
            </>
          ) : (
            <button
              type="button"
              className={`${formStyles.btnPrimary} ${formStyles.btnPrimarySmall}`}
              onClick={() => handleSaveExercise(exercise)}
              disabled={isActionPending || isLoadingExercises}
            >
              Сохранить изменения
            </button>
          )}
        </div>
      </div>
    );
  };

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
            <button
              type="button"
              className={styles.btnTimerPause}
              onClick={togglePause}
              disabled={isActionPending}
            >
              {running ? '⏸ Пауза' : '▶ Продолжить'}
            </button>
            <button
              type="button"
              className={styles.btnTimerFinish}
              onClick={handleFinish}
              disabled={isActionPending}
            >
              ✅ Завершить
            </button>
          </div>
        </div>
      </div>

      <div className={pageStyles.pageTitle}>Активная тренировка</div>
      <div className={`${pageStyles.pageSub} ${pageStyles.pageSubCompact}`}>
        Упражнения сохраняются сразу на сервер
      </div>

      {(pageError || syncError) && (
        <div className={pageStyles.pageError}>{pageError || syncError}</div>
      )}

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
            onClick={beginDraftExercise}
            disabled={isLoadingExercises || isActionPending || Boolean(draftExercise)}
          >
            + Добавить упражнение
          </button>
        </div>

        {isLoadingExercises ? (
          <div className={pageStyles.pageStatus}>Загрузка упражнений...</div>
        ) : (
          <>
            {exercises.length === 0 && !draftExercise && (
              <div className={styles.emptyExercises}>
                Упражнений пока нет. Нажмите «Добавить упражнение», чтобы записать первое.
              </div>
            )}

            {exercises.map((exercise, index) =>
              renderExerciseForm(exercise, { isDraft: false, index }),
            )}

            {draftExercise && renderExerciseForm(draftExercise, { isDraft: true, index: 0 })}
          </>
        )}
      </div>

      <div className={formStyles.formCard}>
        <div className={formStyles.formSectionTitle}>Заметки (необязательно)</div>
        <textarea
          className={`${formStyles.formInput} ${formStyles.formTextarea}`}
          placeholder="Добавьте заметки о тренировке..."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={isActionPending}
        />
      </div>

      <div className={formStyles.formActions}>
        <button
          type="button"
          className={`${formStyles.btnPrimary} ${formStyles.btnPrimaryLarge}`}
          onClick={handleFinish}
          disabled={isActionPending}
        >
          {isActionPending ? 'Сохранение...' : '✅ Завершить тренировку'}
        </button>
        <button
          type="button"
          className={`${formStyles.btnOutline} ${formStyles.btnOutlineLarge}`}
          onClick={handleCancel}
          disabled={isActionPending}
        >
          Отмена
        </button>
      </div>
    </>
  );
});

export default ActiveWorkoutPage;
