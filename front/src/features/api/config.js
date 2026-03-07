const useLocalEndpoints = true;

export const urls = {
  ...(useLocalEndpoints
    ? { api: 'http://localhost:5000' }
    : { api: 'http://ip:5000' }),
};
