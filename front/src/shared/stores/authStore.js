import { makeAutoObservable } from 'mobx';
import api from '../../features/api/api';

const LOGIN_STORAGE_KEY = 'gymtracker-login';

class AuthStore {
  accessToken = null;
  isAuthenticated = false;
  isInitialized = false;
  login = localStorage.getItem(LOGIN_STORAGE_KEY) ?? '';

  constructor() {
    makeAutoObservable(this);
  }

  setAccessToken = (token) => {
    this.accessToken = token;
    this.isAuthenticated = !!token;
  };

  setLogin = (login) => {
    this.login = login;
    localStorage.setItem(LOGIN_STORAGE_KEY, login);
  };

  clearLogin = () => {
    this.login = '';
    localStorage.removeItem(LOGIN_STORAGE_KEY);
  };

  init = async () => {
    try {
      await api.refreshToken();
    } catch {
      api.clearAuth();
    } finally {
      this.isInitialized = true;
    }
  };

  logout = () => {
    api.clearAuth();
  };
}

export const authStore = new AuthStore();
