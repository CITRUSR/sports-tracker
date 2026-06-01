import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RouteGuard from '../shared/components/routeGuard/RouteGuard';
import { routes } from './Routes';

function wrapRouteElement(route) {
  if (!route.access) {
    return route.element;
  }

  return <RouteGuard access={route.access}>{route.element}</RouteGuard>;
}

function renderRoute(route) {
  const element = wrapRouteElement(route);

  if (route.children) {
    return (
      <Route key={route.path ?? 'layout'} path={route.path} element={element}>
        {route.children.map(renderRoute)}
      </Route>
    );
  }

  return <Route key={route.path} path={route.path} element={element} index={route.index} />;
}

function Router() {
  return (
    <BrowserRouter>
      <Routes>{routes.map(renderRoute)}</Routes>
    </BrowserRouter>
  );
}

export default Router;
