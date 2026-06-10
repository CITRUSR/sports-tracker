import { useMemo } from 'react';
import SearchableInput from '../searchableInput/SearchableInput';

function ExerciseSelect({
  id,
  exercises = [],
  value,
  onChange,
  placeholder = 'Выберите упражнение',
  allowEmpty = false,
  emptyLabel = 'Все упражнения',
  disabled = false,
  loading = false,
  error = false,
  inputClassName = '',
  className = '',
}) {
  const options = useMemo(
    () =>
      exercises.map((exercise) => ({
        value: String(exercise.id),
        label: exercise.name,
      })),
    [exercises],
  );

  const emptyOption = allowEmpty ? { value: '', label: emptyLabel } : null;

  return (
    <SearchableInput
      id={id}
      options={options}
      value={value == null ? '' : String(value)}
      onChange={onChange}
      placeholder={loading ? 'Загрузка...' : placeholder}
      emptyOption={emptyOption}
      disabled={disabled || loading}
      error={error}
      noResultsText="Упражнение не найдено"
      inputClassName={inputClassName}
      className={className}
    />
  );
}

export default ExerciseSelect;
