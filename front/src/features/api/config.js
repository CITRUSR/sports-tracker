const useLocalEndpoints = false;

export const urls = {
  ...(useLocalEndpoints
    ? { api: 'http://localhost:5000/api' }
    : { api: 'http://176.108.255.65:80/api' }),
};
