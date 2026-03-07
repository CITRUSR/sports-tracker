import axios from 'axios';
import { urls } from './config.js';

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
};
