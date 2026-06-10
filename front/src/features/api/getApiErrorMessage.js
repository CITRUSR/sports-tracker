import { translateApiMessage } from './apiErrorMessages';

function collectStringValues(value) {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStringValues);
  }

  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectStringValues);
  }

  return [];
}

function extractApiErrorMessages(data) {
  if (data == null) {
    return [];
  }

  if (typeof data === 'string') {
    return [data];
  }

  if (Array.isArray(data)) {
    return collectStringValues(data);
  }

  if (typeof data === 'object') {
    if ('message' in data) {
      return collectStringValues(data.message);
    }

    if ('errors' in data) {
      return collectStringValues(data.errors);
    }

    return collectStringValues(data);
  }

  return [];
}

export function getApiErrorMessage(error, fallback = 'Что-то пошло не так. Попробуйте ещё раз.') {
  const messages = extractApiErrorMessages(error?.response?.data);

  if (!messages.length) {
    return fallback;
  }

  return messages.map(translateApiMessage).join(', ');
}
