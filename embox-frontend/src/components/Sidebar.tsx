import { useNavigate, useLocation } from "react-router-dom"
import LogoGym from "../assets/logoqj.jpg"

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) =>
    location.pathname === path
      ? "bg-red-600 text-white"
      : "text-gray-300 hover:bg-zinc-800"

  return (
    <aside className="w-64 bg-black h-screen flex flex-col border-r border-zinc-800">

      {/* LOGO QJ FITNESS */}
      <div className="p-6 flex flex-col items-center">
        <img src={LogoGym} alt="QJ Fitness" className="w-32" />
        <p className="text-gray-400 text-sm mt-2">
          QJ Fitness
        </p>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-2">
        <button
          onClick={() => navigate("/dashboard")}
          className={`w-full text-left px-4 py-3 rounded transition ${isActive("/dashboard")}`}
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/users")}
          className={`w-full text-left px-4 py-3 rounded transition ${isActive("/users")}`}
        >
          Usuarios
        </button>

        <button
          onClick={() => navigate("/reports")}
          className={`w-full text-left px-4 py-3 rounded transition ${isActive("/reports")}`}
        >
          Reportes
        </button>
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-zinc-800 text-gray-500 text-xs text-center space-y-1">
        <div>Licensed to QJ Fitness</div>
		<div>Powered by eMBOX – Developed by Erwin Muñoz </div>
        <div>© {new Date().getFullYear()} QJ Fitness</div>
      </div>

    </aside>
  )
}
