import Sidebar from "../components/Sidebar"
import LogoApp from "../assets/emboxlogo.png"
import { Outlet } from "react-router-dom"

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 bg-zinc-900 p-8 overflow-auto relative">

        {/* CONTENIDO DINÁMICO DE LAS RUTAS */}
        <Outlet />

        {/* MARCA DEL SISTEMA – eMBOX */}
        <div className="absolute bottom-4 right-6 opacity-40">
          <img
            src={LogoApp}
            alt="eMBOX"
            className="w-24"
          />
        </div>

      </main>
    </div>
  )
}
