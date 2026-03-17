import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePos } from "../../state/posStore";

export function GuestOnlyRoute() {
  const { currentUser, pendingPasswordUser } = usePos();
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  if (pendingPasswordUser) {
    return <Navigate to="/change-password" replace />;
  }
  return <Outlet />;
}

export function ProtectedRoute({ allowedRoles }) {
  const { currentUser, pendingPasswordUser } = usePos();
  const location = useLocation();

  if (pendingPasswordUser) {
    return <Navigate to="/change-password" replace />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
