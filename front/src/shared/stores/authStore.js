import { makeAutoObservable } from 'mobx';
import api from '../../features/api/api';

class AuthStore {
  accessToken = null;
  isAuthenticated = false;
  isInitialized = false;

  constructor() {
    makeAutoObservable(this);
  }

  setAccessToken = (token) => {
    this.accessToken = token;
    this.isAuthenticated = !!token;
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
