import { useState } from "react"
import Logo from "./assets/logo.png"
import { login, saveToken } from "./services/auth"
import { getCustomers } from "./services/customers"

export const Home = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = await login(username, password)
      saveToken(token)
      alert("Login exitoso")
      console.log("TOKEN:", token)
    } catch (error) {
      console.error("Login error:", error)
      alert("Login falló (backend no responde o credenciales inválidas)")
    }
  }

  const handleGetCustomers = async () => {
    try {
      const data = await getCustomers()
      console.log("CUSTOMERS:", data)
      alert("Customers cargados (ver consola)")
    } catch (error) {
      console.error("Customers error:", error)
      alert("Error cargando customers")
    }
  }

  return (
    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-white">
      <img src={Logo} alt="Logo Gym" className="w-64 mb-8" />

      <h1 className="text-4xl font-bold text-red-600 mb-4">
        Bienvenido a eMBox
      </h1>

      <p className="text-white mb-6">
        Inicia sesión para continuar
      </p>

      <form className="flex flex-col w-80" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="mb-4 p-2 rounded border border-gray-700 text-black"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="mb-4 p-2 rounded border border-gray-700 text-black"
        />

        <button
          type="submit"
          className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
        >
          Ingresar
        </button>
      </form>

      {/* Botón temporal solo para prueba */}
      <button
        onClick={handleGetCustomers}
        className="mt-6 text-sm underline text-gray-300 hover:text-white"
      >
        Probar carga de customers
      </button>
    </div>
  )
}
