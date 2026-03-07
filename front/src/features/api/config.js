const useLocalEndpoints = true;

export const urls = {
  ...(useLocalEndpoints ? { api: '/api' } : { api: 'http://ip:5000' }),
};
