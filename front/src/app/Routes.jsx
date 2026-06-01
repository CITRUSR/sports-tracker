import Home from '../features/home/HomePage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import NotFoundPage from '../features/notFound/NotFoundPage';
import { ROUTE_ACCESS } from '../constants/routeAccess';
import { ROUTES } from '../constants/routes';
import DefaultLayout from '../shared/layouts/defaultLayout/DefaultLayout';
import AuthLayout from '../shared/layouts/authLayout/AuthLayout';

export const routes = [
  {
    path: ROUTES.HOME,
    access: ROUTE_ACCESS.PRIVATE,
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
