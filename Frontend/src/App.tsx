import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./GlobalFonts.css";
import TransitionWrapper from "./animation";
import Spinner from "./components/common/Spinner";
import useLoading from "./hooks/useLoading";
import AdminLayout from "./layouts/AdminLayout";
import AuthenticatedLayout from "./layouts/Authenticated";
import ClientLayout from "./layouts/ClientLayout";
import WorkerLayout from "./layouts/WorkerLayout";
import NotFound from "./pages/404";
import LandingPage from "./pages/client/LandingPage";
import { AdminRoutes } from "./routes/AdminRoutes";
import { AuthenticatedRoutes } from "./routes/Authenticated";
import { ClientRoutes } from "./routes/ClientRoutes";
import ConfirmationPage from "./routes/ConfirmationPage";
import Login from "./routes/Login";
import PrivateRoute from "./routes/PrivateRoutes";
import Register from "./routes/Register";
import { RegistrationSuccess } from "./routes/RegistrationSuccess"; // adjust the path to where you keep your VirifyRoutes
import ResetPassword from "./routes/ResetPassword";
import { WorkerRoutes } from "./routes/WorkerRoutes";
function App() {
  const loading = useLoading(3000);

  return (
    <>
      <Routes>
        {/* Add VerifyPage route here */}
        {RegistrationSuccess.map(({ path, component: Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <Suspense fallback={loading && <Spinner />}>
                <Component />
              </Suspense>
            }
          />
        ))}
        {/* Public Routes with Client Layout */}

        <Route path="login" element={<Login />} />
        <Route path="verify-email/:token" element={<ConfirmationPage />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="register" element={<Register />} />
        <Route path="/" element={<ClientLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        <Route
          path="/"
          element={
            sessionStorage.getItem("userRole") === "admin" ? (
              <Navigate to="/Admin/Dashboard" replace />
            ) : (
              <Suspense fallback={loading && <Spinner />}>
                <ClientLayout />
              </Suspense>
            )
          }
        >
          {ClientRoutes.map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <TransitionWrapper>
                  <Component />
                </TransitionWrapper>
              }
            />
          ))}
        </Route>
        {/* Admin Routes - Protected */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route
            path="/Admin"
            element={
              <Suspense fallback={loading && <Spinner />}>
                <AdminLayout />
              </Suspense>
            }
          >
            {AdminRoutes.map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <TransitionWrapper>
                    <Component />
                  </TransitionWrapper>
                }
              />
            ))}
          </Route>
        </Route>
        {/* Worker Routes - Protected */}
        <Route element={<PrivateRoute allowedRoles={["worker"]} />}>
          <Route
            path="/"
            element={
              <Suspense fallback={loading && <Spinner />}>
                <WorkerLayout />
              </Suspense>
            }
          >
            {WorkerRoutes.map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <TransitionWrapper>
                    <Component />
                  </TransitionWrapper>
                }
              />
            ))}
          </Route>
        </Route>
        {/* Authenticated Routes */}
        <Route
          path="/"
          element={
            <Suspense fallback={loading && <Spinner />}>
              <AuthenticatedLayout />
            </Suspense>
          }
        >
          {AuthenticatedRoutes.map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <TransitionWrapper>
                  <Component />
                </TransitionWrapper>
              }
            />
          ))}
        </Route>
        {/* 404 Route */}
        <Route
          path="/*"
          element={
            <Suspense fallback={loading && <Spinner />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}

export default App;
