const useLocalEndpoints = true;

export const urls = {
  ...(useLocalEndpoints
    ? { api: 'http://localhost:5000/api' }
    : { api: 'https://sports-tracker.ru/api' }),
};
