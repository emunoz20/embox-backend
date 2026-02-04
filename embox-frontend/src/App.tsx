// src/App.tsx
import { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom"
import axios from "axios"
import Logo from "./assets/logo.png"
import { login, saveToken, getToken, logout } from "./services/auth"

interface Customer {
  id: string
  full_name: string
  phone: string
  plan_name: string
  due_date: string
  calculated_status: string
  should_send_reminder: boolean
}

/* ====================
   LOGIN (REAL)
==================== */
const Home = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = await login(username, password)
      saveToken(token)
      navigate("/dashboard")
    } catch {
      alert("Usuario o contraseña inválidos")
    }
  }

  return (
    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-white">
      <img src={Logo} alt="Logo Gym" className="w-64 mb-8" />
      <h1 className="text-4xl font-bold text-red-600 mb-6">Bienvenido a eMBox</h1>

      <form
        onSubmit={handleLogin}
        className="flex flex-col w-80 bg-gray-900 p-6 rounded-lg shadow-lg"
      >
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 p-2 rounded border border-gray-700 text-black"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 p-2 rounded border border-gray-700 text-black"
        />
        <button
          type="submit"
          className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
        >
          Ingresar
        </button>
      </form>
    </div>
  )
}

/* ====================
   DASHBOARD (PROTEGIDO)
==================== */
const Dashboard = () => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])

  const token = getToken()

  // 🚫 Protección dura
  if (!token) {
    return <Navigate to="/" replace />
  }

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/customers", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setCustomers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-red-600">eMBox Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Cerrar sesión
        </button>
      </div>

      <table className="border w-full text-left bg-white shadow-md">
        <thead>
          <tr className="bg-red-600 text-white">
            <th className="border px-2 py-1">Nombre</th>
            <th className="border px-2 py-1">Teléfono</th>
            <th className="border px-2 py-1">Plan</th>
            <th className="border px-2 py-1">Vence</th>
            <th className="border px-2 py-1">Estado</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td className="border px-2 py-1">{c.full_name}</td>
              <td className="border px-2 py-1">{c.phone}</td>
              <td className="border px-2 py-1">{c.plan_name}</td>
              <td className="border px-2 py-1">{c.due_date}</td>
              <td className="border px-2 py-1">{c.calculated_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ====================
   APP ROUTER
==================== */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
