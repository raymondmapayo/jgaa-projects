import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const userRole = sessionStorage.getItem("userRole");
  const isAuthenticated = !!userRole;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />; // Redirect to login if not authenticated
  }

  return allowedRoles.includes(userRole) ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace /> // Redirect non-admin users to home
  );
};

export default PrivateRoute;
