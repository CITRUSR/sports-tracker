import { observer } from 'mobx-react-lite';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTE_ACCESS } from '../../../constants/routeAccess';
import { ROUTES } from '../../../constants/routes';
import { authStore } from '../../stores/authStore';

const RouteGuard = observer(function RouteGuard({
  access = ROUTE_ACCESS.PUBLIC,
  children,
}) {
  const location = useLocation();

  if (!authStore.isInitialized) {
    return null;
  }

  if (access === ROUTE_ACCESS.PRIVATE && !authStore.isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (access === ROUTE_ACCESS.GUEST && authStore.isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
});

export default RouteGuard;
