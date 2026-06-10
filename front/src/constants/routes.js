export const ROUTES = {
  HOME: '/',
  WORKOUTS: '/workouts',
  WORKOUT_DETAIL: '/workouts/:workoutId',
  NEW_WORKOUT: '/workouts/new',
  ACTIVE_WORKOUT: '/workouts/active',
  PROGRESS: '/progress',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  LOGIN: '/login',
  REGISTER: '/register',
  NOT_FOUND: '*',
};

export function getWorkoutDetailPath(workoutId) {
  return `/workouts/${workoutId}`;
}
