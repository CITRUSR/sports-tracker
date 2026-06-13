export const EXERCISE_TYPE = {
  CARDIO: 10,
  STRENGTH: 20,
  FLEXIBILITY: 30,
};

export const EXERCISE_TYPE_OPTIONS = [
  { value: EXERCISE_TYPE.STRENGTH, label: 'Силовое' },
  { value: EXERCISE_TYPE.CARDIO, label: 'Кардио' },
  { value: EXERCISE_TYPE.FLEXIBILITY, label: 'Гибкость' },
];

export function getExerciseTypeLabel(type) {
  return EXERCISE_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? 'Неизвестно';
}
