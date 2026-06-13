import { useState } from 'react';
import { EXERCISE_TYPE, EXERCISE_TYPE_OPTIONS, getExerciseTypeLabel } from '../../../constants/exerciseTypes';
import pageStyles from '../../../shared/layouts/gymLayout/gymPage.module.css';
import { useExercisesPage } from '../useExercisesPage';
import styles from './ExercisesPage.module.css';

function ExercisesPage() {
  const { userExercises, isLoading, isSaving, error, createExercise } = useExercisesPage();
  const [name, setName] = useState('');
  const [type, setType] = useState(EXERCISE_TYPE.STRENGTH);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setValidationError('Введите название упражнения');
      return;
    }

    setValidationError('');
    const isCreated = await createExercise({ name, type });

    if (isCreated) {
      setName('');
      setType(EXERCISE_TYPE.STRENGTH);
    }
  };

  return (
    <>
      <div className={pageStyles.pageTitle}>Мои упражнения</div>
      <div className={pageStyles.pageSub}>
        Добавляйте свои упражнения — они появятся при записи тренировок
      </div>

      {(error || validationError) && (
        <div className={pageStyles.pageError}>{validationError || error}</div>
      )}

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.sectionTitle}>Новое упражнение</div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="exercise-name">
            Название
          </label>
          <input
            id="exercise-name"
            className={styles.formInput}
            value={name}
            onChange={(event) => {
              setValidationError('');
              setName(event.target.value);
            }}
            placeholder="Например, Жим гантелей"
            disabled={isSaving}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="exercise-type">
            Тип
          </label>
          <select
            id="exercise-type"
            className={styles.formSelect}
            value={type}
            onChange={(event) => setType(Number(event.target.value))}
            disabled={isSaving}
          >
            {EXERCISE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={styles.btnPrimary} disabled={isSaving}>
          {isSaving ? 'Добавление...' : '+ Добавить упражнение'}
        </button>
      </form>

      <div className={styles.sectionTitle}>Добавленные вами</div>

      {isLoading ? (
        <div className={pageStyles.pageStatus}>Загрузка...</div>
      ) : userExercises.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>💪</div>
          <div className={styles.emptyTitle}>Пока нет своих упражнений</div>
          <div className={styles.emptyDesc}>
            Создайте первое упражнение — оно станет доступно в тренировках
          </div>
        </div>
      ) : (
        userExercises.map((exercise) => (
          <div className={styles.exerciseCard} key={exercise.id}>
            <div className={styles.exerciseName}>{exercise.name}</div>
            <div className={styles.exerciseBadge}>{getExerciseTypeLabel(exercise.type)}</div>
          </div>
        ))
      )}
    </>
  );
}

export default ExercisesPage;
