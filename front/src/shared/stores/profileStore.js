import { makeAutoObservable } from 'mobx';
import { DEFAULT_PROFILE, PROFILE_STORAGE_KEY } from '../../features/profile/constants';

function readStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!raw) {
      return DEFAULT_PROFILE;
    }

    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
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
    this.profile = nextProfile;
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
  };
}

export const profileStore = new ProfileStore();
