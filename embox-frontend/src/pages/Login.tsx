import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Logo from "../assets/emboxlogo.png"
import { login, saveToken } from "../services/auth"

export default function Login() {
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
      <h1 className="text-4xl font-bold text-red-600 mb-6">
        Bienvenido a eMBox
      </h1>

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
