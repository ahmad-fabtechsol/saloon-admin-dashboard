import { useEffect, useRef } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { toast } from "sonner"
import { ProtectedRoute, GuestRoute } from "@/components/ProtectedRoute"
import AppHeader from "@/components/sidebar/app-header"
import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import Dashboard from "@/components/dashboard/Dashboard"
import Salons from "@/components/salon/Salons"
import SalonDetail from "@/components/salon/SalonDetail"
import Customers from "@/components/customers/Customers"
import Bookings from "@/components/bookings/Bookings"
import Reports from "@/components/reports/Reports"
import Settings from "@/components/settings/Settings"
import Notifications from "@/components/notifications/Notifications"
import NotFound from "@/pages/NotFound"

const testNotifications = [
  { type: "success", message: "New booking confirmed — Appointment #1043" },
  { type: "error",   message: "Salon 'Glow Studio' failed verification" },
  { type: "warning", message: "Customer Ahmed Ali has 3 no-shows" },
  { type: "info",    message: "Monthly report is ready to download" },
]

export default function App() {
  const indexRef = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      const { type, message } = testNotifications[indexRef.current % testNotifications.length]
      toast[type](message)
      indexRef.current += 1
    }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
          {/* Root redirect — GuestRoute bounces authenticated users to /dashboard */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes — redirect to dashboard if already logged in */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Protected routes — rendered inside the sidebar layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppHeader />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/salons" element={<Salons />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/bookings" element={<Bookings />} />
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
