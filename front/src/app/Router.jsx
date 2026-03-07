import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from './Routes';

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
