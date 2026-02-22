import { createBrowserRouter } from "react-router";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AmbulanceDashboard from "./pages/AmbulanceDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import TrafficDashboard from "./pages/TrafficDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/ambulance",
    element: (
      <ProtectedRoute allowedRoles={['ambulance']}>
        <AmbulanceDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/hospital",
    element: (
      <ProtectedRoute allowedRoles={['hospital']}>
        <HospitalDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/traffic",
    element: (
      <ProtectedRoute allowedRoles={['traffic']}>
        <TrafficDashboard />
      </ProtectedRoute>
    ),
  },
]);
