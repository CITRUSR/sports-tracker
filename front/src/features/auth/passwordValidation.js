export const PASSWORD_REQUIREMENTS_HINT =
  'Не менее 6 символов, заглавная и строчная буква, цифра и спецсимвол';

export function validatePassword(password) {
  const errors = [];

  if (password.length < 6) {
    errors.push('Пароль должен быть не менее 6 символов');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну заглавную букву');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну строчную букву');
  }
  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну цифру');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы один спецсимвол');
  }

  return errors;
}

export function getPasswordValidationError(password) {
  const errors = validatePassword(password);
  return errors[0] ?? '';
}
