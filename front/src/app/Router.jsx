import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from './Routes';

function renderRoute(route) {
  if (route.children) {
    return (
      <Route key={route.path ?? 'layout'} path={route.path} element={route.element}>
        {route.children.map(renderRoute)}
      </Route>
    );
  }

  return <Route key={route.path} path={route.path} element={route.element} index={route.index} />;
}

function Router() {
  return (
    <BrowserRouter>
      <Routes>{routes.map(renderRoute)}</Routes>
    </BrowserRouter>
  );
}

export default Router;
