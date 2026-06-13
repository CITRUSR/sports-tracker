//TODO: get from backend
const DEFAULT_EXERCISE_NAMES = new Set([
  'Жим лежа',
  'Присед со штангой',
  'Становая тяга',
  'Жим штанги стоя',
  'Подтягивания',
  'Тяга штанги в наклоне',
  'Отжимания на брусьях',
  'Гиперэкстензия',
  'Сгибание рук на бицепс',
  'Разгибание рук на трицепс',
  'Бег на дорожке',
  'Эллипсоид',
  'Велотренажёр',
  'Скакалка',
  'Гребной тренажёр',
  'Интервальный бег',
  'Растяжка задней поверхности бедра',
  'Растяжка квадрицепса',
  'Растяжка плеч',
  'Наклоны к ногам сидя',
  'Поза ребенка (йога)',
  'Кошка-корова',
  'Вращения тазом и суставная разминка',
]);

export function isDefaultExercise(name) {
  return DEFAULT_EXERCISE_NAMES.has(name);
}

export function getUserExercises(exercises) {
  return exercises.filter((exercise) => !isDefaultExercise(exercise.name));
}
