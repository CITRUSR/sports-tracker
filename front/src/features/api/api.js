import axios from 'axios';
import { urls } from './config.js';
import { authStore } from '../../shared/stores/authStore.js';

axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${urls.api}/auth/refresh`,
          {}
        );
        const token = refreshResponse.data;
        authStore.setAccessToken(token);

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;

        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed', refreshError);
        throw refreshError;
      }
    }

    throw error;
  }
);

const errorHandler = (error) => {
  if (error?.response?.status == 400 && error?.response?.data?.message) {
    console.error('Bad request:', error.response.data.message);
  } else if (error?.response?.status == 401) {
    console.error('Unauthorized access. Please log in.');
  } else if (error?.response?.status == 403) {
    console.error('Forbidden access. You do not have permission.');
  } else {
    console.error('An unknown error occurred:', error.message);
  }
};

const getUrl = (endpoint) => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  } else {
    return `${urls.api}/${endpoint}`;
  }
};

const BaseApi = {
  get: async (url, config = {}) => {
    try {
      const response = await axios.get(getUrl(url), config);
      return response.data;
    } catch (error) {
      errorHandler(error);
      throw error;
    }
  },
  post: async (url, model, config = {}) => {
    try {
      const response = await axios.post(getUrl(url), model, config);
      return response.data;
    } catch (error) {
      errorHandler(error);
      throw error;
    }
  },
  put: async (url, model, config = {}) => {
    try {
      const response = await axios.put(getUrl(url), model, config);
      return response.data;
    } catch (error) {
      errorHandler(error);
      throw error;
    }
  },
  patch: async (url, model, config = {}) => {
    try {
      const response = await axios.patch(getUrl(url), model, config);
      return response.data;
    } catch (error) {
      errorHandler(error);
      throw error;
    }
  },
  delete: async (url, config = {}) => {
    try {
      const response = await axios.delete(getUrl(url), config);
      return response.data;
    } catch (error) {
      errorHandler(error);
      throw error;
    }
  },
};

export default {
  apiUrl: urls.api,

  healthCheck: () => BaseApi.get('healthcheck'),
  login: (model) => BaseApi.post('auth/login', model),
  refreshToken: () => BaseApi.post('auth/refresh'),
};
