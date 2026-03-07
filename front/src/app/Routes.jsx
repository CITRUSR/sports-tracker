import Home from '../features/home/HomePage';
import DefaultLayout from '../shared/layouts/defaultLayout/DefaultLayout';

export const routes = [
  {
    path: '/',
    element: (
      <DefaultLayout>
        <Home />
      </DefaultLayout>
    ),
  },
];
