const SERVER_ERROR_MESSAGES = {
  'Invalid login or password': 'Неверный логин или пароль',
  'User with same login already exists': 'Пользователь с таким логином уже существует',
};

function translateMessage(message) {
  return SERVER_ERROR_MESSAGES[message] ?? message;
}

export function getAuthErrorMessage(error) {
  const data = error?.response?.data;

  if (Array.isArray(data)) {
    return data.map(translateMessage).join(', ');
  }

  if (typeof data === 'string') {
    return translateMessage(data);
  }

  return 'Что-то пошло не так. Попробуйте ещё раз.';
}
