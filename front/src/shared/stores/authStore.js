import { makeAutoObservable } from 'mobx';
import api from '../../features/api/api';

class AuthStore {
  accessToken = null;
  isAuthenticated = false;

  constructor() {
    makeAutoObservable(this);
  }

  setAccessToken = (token) => {
    this.accessToken = token;
    this.isAuthenticated = !!token;
  };

  init = async () => {
    try {
      const token = await api.refreshToken();
      this.setAccessToken(token);
    } catch {
      this.setAccessToken(null);
    }
  };

  logout = () => {
    this.setAccessToken(null);
  };
}

export const authStore = new AuthStore();
