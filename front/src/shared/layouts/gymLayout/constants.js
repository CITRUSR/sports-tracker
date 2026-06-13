import { ROUTES } from '../../../constants/routes';

export const NAV_TABS = [
  { path: ROUTES.HOME, icon: '🏠', label: 'Главная' },
  { path: ROUTES.WORKOUTS, icon: '📋', label: 'Тренировки' },
  { path: ROUTES.EXERCISES, icon: '💪', label: 'Упражнения' },
  { path: ROUTES.PROGRESS, icon: '📈', label: 'Прогресс', comingSoon: true },
];
