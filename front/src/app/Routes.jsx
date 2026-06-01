import Home from '../features/home/HomePage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import DefaultLayout from '../shared/layouts/defaultLayout/DefaultLayout';
import AuthLayout from '../shared/layouts/authLayout/AuthLayout';

export const routes = [
  {
    path: '/',
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
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
];
