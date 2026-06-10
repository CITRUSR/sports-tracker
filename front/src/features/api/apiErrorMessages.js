const EXACT_MESSAGES = {
  'Invalid login or password': 'Неверный логин или пароль',
  'User with same login already exists': 'Пользователь с таким логином уже существует',
  'Exercise with same name already exists': 'Упражнение с таким названием уже существует',
  'Profile not found': 'Профиль не найден',
  'Invalid birth date': 'Некорректная дата рождения',
  'Another workout already in progress': 'Уже есть активная тренировка',
  'No workouts in progress': 'Нет активной тренировки',
  'Workout not found': 'Тренировка не найдена',
  'Exercise not found': 'Упражнение не найдено',
  'Workout is already paused': 'Тренировка уже на паузе',
  'Workout is not paused': 'Тренировка не на паузе',
  'Exercise entry not found': 'Запись упражнения не найдена',
  'Unknown exercise type': 'Неизвестный тип упражнения',
  'Distance and duration not allowed for strength exercises':
    'Дистанция и длительность недоступны для силовых упражнений',
  'Repetitions required': 'Укажите количество повторений',
  'Weight cannot be negative': 'Вес не может быть отрицательным',
  'Distance, repetitions or duration must be provided':
    'Укажите дистанцию, повторения или длительность',
  'Distance and repetitions cannot be used together':
    'Дистанцию и повторения нельзя указывать одновременно',
  'Weight is not allowed for cardio exercises':
    'Вес недоступен для кардио-упражнений',
  'Record not found': 'Запись не найдена',
  'Cannot delete first record': 'Нельзя удалить первую запись',
  'Refresh token not found': 'Сессия истекла. Войдите снова',
  'Refresh token is revoked': 'Сессия истекла. Войдите снова',
  'Refresh token expired': 'Сессия истекла. Войдите снова',
  'Refresh token is invalid': 'Сессия истекла. Войдите снова',
  'The Login field is required.': 'Укажите логин',
  'The Password field is required.': 'Укажите пароль',
  'The ConfirmPassword field is required.': 'Подтвердите пароль',
  "'ConfirmPassword' and 'Password' do not match.": 'Пароли не совпадают',
  'Passwords must be at least 6 characters.': 'Пароль должен быть не менее 6 символов',
  'Passwords must have at least one non alphanumeric character.':
    'Пароль должен содержать хотя бы один спецсимвол',
  "Passwords must have at least one digit ('0'-'9').":
    'Пароль должен содержать хотя бы одну цифру',
  "Passwords must have at least one lowercase ('a'-'z').":
    'Пароль должен содержать хотя бы одну строчную букву',
  "Passwords must have at least one uppercase ('A'-'Z').":
    'Пароль должен содержать хотя бы одну заглавную букву',
};

const PATTERN_MESSAGES = [
  {
    pattern: /^User name '.*' is already taken\.$/,
    text: 'Пользователь с таким логином уже существует',
  },
  {
    pattern: /^Username '.*' is already taken\.$/,
    text: 'Пользователь с таким логином уже существует',
  },
  {
    pattern: /^Passwords must be at least \d+ characters\.$/,
    text: 'Пароль должен быть не менее 6 символов',
  },
];

export function translateApiMessage(message) {
  if (typeof message !== 'string') {
    return message;
  }

  const trimmed = message.trim();
  const exact = EXACT_MESSAGES[trimmed];

  if (exact) {
    return exact;
  }

  const matchedPattern = PATTERN_MESSAGES.find(({ pattern }) => pattern.test(trimmed));

  return matchedPattern?.text ?? trimmed;
}
