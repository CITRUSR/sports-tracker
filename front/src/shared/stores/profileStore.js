import { makeAutoObservable } from 'mobx';
import { DEFAULT_PROFILE, PROFILE_STORAGE_KEY } from '../../features/profile/constants';

function normalizeProfile(stored) {
  const login =
    stored.login ??
    stored.handle?.replace(/^@/, '') ??
    stored.name ??
    DEFAULT_PROFILE.login;

  return {
    login,
    avatar: stored.avatar ?? DEFAULT_PROFILE.avatar,
    age: stored.age ?? DEFAULT_PROFILE.age,
    weight: stored.weight ?? DEFAULT_PROFILE.weight,
  };
}

function readStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!raw) {
      return DEFAULT_PROFILE;
    }

    return normalizeProfile(JSON.parse(raw));
  } catch {
    return DEFAULT_PROFILE;
  }
}

class ProfileStore {
  profile = readStoredProfile();

  constructor() {
    makeAutoObservable(this);
  }

  saveProfile = (nextProfile) => {
    const profile = normalizeProfile(nextProfile);
    this.profile = profile;
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  };
}

export const profileStore = new ProfileStore();
