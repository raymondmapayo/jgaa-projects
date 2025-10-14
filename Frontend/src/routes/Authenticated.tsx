import { lazy } from "react";
import { Navigate } from "react-router-dom";

const isAuthenticated = sessionStorage.getItem("isAuthenticated");

export const AuthenticatedRoutes = [
  {
    path: "/Login",
    component: isAuthenticated
      ? () => <Navigate to="/" />
      : lazy(() => import("./Login")),
  },
  {
    path: "/Register",
    component: lazy(() => import("./Register")),
  },
];
