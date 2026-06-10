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
        applyAuthToken(token);
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

const applyAuthToken = (token) => {
  if (token) {
    authStore.setAccessToken(token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    authStore.setAccessToken(null);
    delete axios.defaults.headers.common['Authorization'];
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
  login: async (model) => {
    const token = await BaseApi.post('auth/login', model);
    applyAuthToken(token);
    authStore.setLogin(model.login);
    return token;
  },
  register: (model) => BaseApi.post('auth/register', model),
  refreshToken: async () => {
    const token = await BaseApi.post('auth/refresh');
    applyAuthToken(token);
    return token;
  },
  clearAuth: () => {
    applyAuthToken(null);
    authStore.clearLogin();
  },

  getProfile: () => BaseApi.get('profiles'),
  createProfile: (model) => BaseApi.post('profiles', model),
  updateProfile: (model) => BaseApi.put('profiles', model),

  getStatistics: () => BaseApi.get('statistics'),
  getExercises: () => BaseApi.get('exercises'),
  getWorkouts: ({ from, to, onlyWorkoutsWithExerciseId }) => {
    const params = new URLSearchParams({ from, to });

    if (onlyWorkoutsWithExerciseId) {
      params.set('onlyWorkoutsWithExerciseId', onlyWorkoutsWithExerciseId);
    }

    return BaseApi.get(`workouts?${params.toString()}`);
  },
  getWorkout: async (workoutId) => {
    try {
      return await BaseApi.get(`workouts/${workoutId}`);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },
  getActiveWorkout: async () => {
    try {
      return await BaseApi.get('workouts/active');
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },
  beginWorkout: () => BaseApi.post('workouts', {}),
  finishWorkout: (comment) =>
    BaseApi.post('workouts/finish', comment ?? '', {
      headers: { 'Content-Type': 'application/json' },
      transformRequest: [(data) => JSON.stringify(data)],
    }),
  pauseWorkout: () => BaseApi.post('workouts/pause', {}),
  resumeWorkout: () => BaseApi.post('workouts/resume', {}),
  cancelWorkout: () => BaseApi.delete('workouts/active'),
  addExerciseEntry: (workoutId, entry) =>
    BaseApi.post(`workouts/${workoutId}/exercise-entries`, entry),
  updateExerciseEntry: (workoutId, entryId, entry) =>
    BaseApi.put(`workouts/${workoutId}/exercise-entries/${entryId}`, entry),
  removeExerciseEntry: (workoutId, entryId) =>
    BaseApi.delete(`workouts/${workoutId}/exercise-entries/${entryId}`),
  createExercise: (name, type = 20) => BaseApi.post('exercises', { name, type }),
};
