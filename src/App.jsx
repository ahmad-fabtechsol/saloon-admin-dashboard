import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { ProtectedRoute, GuestRoute } from "@/components/ProtectedRoute"
import AppHeader from "@/components/sidebar/app-header"
import Login from "@/pages/Login"
import ForgotPassword from "@/pages/ForgotPassword"
import ResetPassword from "@/pages/ResetPassword"
import Dashboard from "@/components/dashboard/Dashboard"
import Salons from "@/components/salon/Salons"
import SalonDetail from "@/components/salon/SalonDetail"
import Customers from "@/components/customers/Customers"
import Bookings from "@/components/bookings/Bookings"
import BookingDetails from "@/components/bookings/BookingDetails"
import Reports from "@/components/reports/Reports"
import Settings from "@/components/settings/Settings"
import Notifications from "@/components/notifications/Notifications"
import NotFound from "@/pages/NotFound"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          {/* Root redirect — GuestRoute bounces authenticated users to /dashboard */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes — redirect to dashboard if already logged in */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Reset password is reached via an emailed link — always accessible */}
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes — rendered inside the sidebar layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppHeader />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/salons" element={<Salons />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/booking-details/:id" element={<BookingDetails />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/salon-details/:id" element={<SalonDetail />} />
              <Route path="/customer-details/:id" element={<Dashboard />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
  )
}
