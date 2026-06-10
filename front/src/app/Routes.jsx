import ActiveWorkoutPage from '../features/activeWorkout/ActiveWorkoutPage/ActiveWorkoutPage';
import GymTracker from '../features/gymTracker/GymTracker/GymTracker';
import WorkoutEntryPage from '../features/workouts/WorkoutEntryPage/WorkoutEntryPage';
import EditProfilePage from '../features/profile/EditProfilePage/EditProfilePage';
import ProfilePage from '../features/profile/ProfilePage/ProfilePage';
import ProgressPage from '../features/progress/ProgressPage/ProgressPage';
import WorkoutDetailPage from '../features/workouts/WorkoutDetailPage/WorkoutDetailPage';
import WorkoutsPage from '../features/workouts/WorkoutsPage/WorkoutsPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import NotFoundPage from '../features/notFound/NotFoundPage';
import { ROUTE_ACCESS } from '../constants/routeAccess';
import { ROUTES } from '../constants/routes';
import DefaultLayout from '../shared/layouts/defaultLayout/DefaultLayout';
import AuthLayout from '../shared/layouts/authLayout/AuthLayout';
import GymLayout from '../shared/layouts/gymLayout/GymLayout';

export const routes = [
  {
    element: (
      <DefaultLayout>
        <GymLayout />
      </DefaultLayout>
    ),
    children: [
      {
        index: true,
        access: ROUTE_ACCESS.PRIVATE,
        element: <GymTracker />,
      },
      {
        path: ROUTES.NEW_WORKOUT,
        access: ROUTE_ACCESS.PRIVATE,
        element: <WorkoutEntryPage />,
      },
      {
        path: ROUTES.ACTIVE_WORKOUT,
        access: ROUTE_ACCESS.PRIVATE,
        element: <ActiveWorkoutPage />,
      },
      {
        path: ROUTES.WORKOUTS,
        access: ROUTE_ACCESS.PRIVATE,
        element: <WorkoutsPage />,
      },
      {
        path: ROUTES.WORKOUT_DETAIL,
        access: ROUTE_ACCESS.PRIVATE,
        element: <WorkoutDetailPage />,
      },
      {
        path: ROUTES.PROGRESS,
        access: ROUTE_ACCESS.PRIVATE,
        element: <ProgressPage />,
      },
      {
        path: ROUTES.PROFILE,
        access: ROUTE_ACCESS.PRIVATE,
        element: <ProfilePage />,
      },
      {
        path: ROUTES.PROFILE_EDIT,
        access: ROUTE_ACCESS.PRIVATE,
        element: <EditProfilePage />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        access: ROUTE_ACCESS.GUEST,
        element: <LoginPage />,
      },
      {
        path: ROUTES.REGISTER,
        access: ROUTE_ACCESS.GUEST,
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: ROUTES.NOT_FOUND,
    access: ROUTE_ACCESS.PUBLIC,
    element: <NotFoundPage />,
  },
];
