import { getApiErrorMessage } from '../api/getApiErrorMessage';

export function getAuthErrorMessage(error) {
  return getApiErrorMessage(error);
}
