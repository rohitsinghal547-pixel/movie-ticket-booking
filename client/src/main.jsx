import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import App from "./App.jsx";
import BookingPage from "./BookingPage.jsx";
import ConfirmationPage from "./ConfirmationPage.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import LoginPage from "./LoginPage.jsx";
import RegisterPage from "./RegisterPage.jsx";
import MyBookings from "./MyBookings.jsx";

import { AuthProvider, useAuth } from "./AuthContext.jsx";

import "./App.css";
import "./index.css";

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />

      <Route path="/book/:id" element={<BookingPage />} />

      <Route
        path="/confirmation"
        element={<ConfirmationPage />}
      />

      <Route path="/register" element={<RegisterPage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/my-bookings" element={<MyBookings />} />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);