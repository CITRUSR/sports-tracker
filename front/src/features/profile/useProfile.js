import { profileStore } from '../../shared/stores/profileStore';

export function useProfile() {
  return {
    profile: profileStore.profile,
    saveProfile: profileStore.saveProfile,
  };
}
