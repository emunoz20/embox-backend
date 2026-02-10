// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login"
import AdminLayout from "./layout/AdminLayout"

import Dashboard from "./pages/admin/Dashboard"
import Users from "./pages/admin/Users"
import Reports from "./pages/admin/Reports"

import AllCustomers from "./pages/dashboard/AllCustomers"
import UnpaidCustomers from "./pages/dashboard/UnpaidCustomers"
import InactiveCustomers from "./pages/dashboard/InactiveCustomers"
import Finance from "./pages/dashboard/Finance"   // ← NUEVO

import { getToken } from "./services/auth"

/* ====================
   PROTECTED ROUTE
==================== */
const ProtectedRoute = () => {
  const token = getToken()
  if (!token) {
    return <Navigate to="/" replace />
  }
  return <AdminLayout />
}

/* ====================
   APP ROUTER
==================== */
function App() {
  return (
    <Router>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* ZONA ADMIN PROTEGIDA */}
        <Route element={<ProtectedRoute />}>

          {/* DASHBOARD */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/all" element={<AllCustomers />} />
          <Route path="/dashboard/unpaid" element={<UnpaidCustomers />} />
          <Route path="/dashboard/inactive" element={<InactiveCustomers />} />
          <Route path="/dashboard/finance" element={<Finance />} /> {/* ← NUEVO */}

          {/* OTRAS SECCIONES */}
          <Route path="/users" element={<Users />} />
          <Route path="/reports" element={<Reports />} />

        </Route>

      </Routes>
    </Router>
  )
}

export default App
