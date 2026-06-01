import Home from '../features/home/HomePage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import { ROUTES } from '../constants/routes';
import DefaultLayout from '../shared/layouts/defaultLayout/DefaultLayout';
import AuthLayout from '../shared/layouts/authLayout/AuthLayout';

export const routes = [
  {
    path: ROUTES.HOME,
    element: (
      <DefaultLayout>
        <Home />
      </DefaultLayout>
    ),
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.REGISTER,
        element: <RegisterPage />,
      },
    ],
  },
];
