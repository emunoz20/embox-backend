import { useEffect, useState } from "react"
import { fetchCustomers } from "../../api/customers"
import { useNavigate } from "react-router-dom"
import { formatDateShort } from "../../utils/formatDate"

export default function AllCustomers() {

  const navigate = useNavigate()

  const [customers, setCustomers] = useState<any[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const load = async () => {
      const data = await fetchCustomers()
      setCustomers(data)
    }
    load()
  }, [])

  const filtered = customers.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  return (
    <div className="space-y-6">

      {/* BOTÓN VOLVER */}
      <button
        onClick={() => navigate("/dashboard")}
        className="text-gray-400 hover:text-white"
      >
        ← Volver al Dashboard
      </button>

      <h1 className="text-2xl font-bold text-white">
        Todos los afiliados
      </h1>

      <input
        type="text"
        placeholder="Buscar por nombre o teléfono"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm p-2 rounded bg-black border border-zinc-700 text-white"
      />

      <div className="bg-black border border-zinc-800 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-gray-300">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Vence</th>
              <th className="p-3 text-left">Estado</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-zinc-800">
                <td className="p-3">{c.full_name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.plan_name}</td>
                <td className="p-3">{formatDateShort(c.due_date)}</td>

                <td
                  className={`p-3 font-semibold ${
                    new Date(c.due_date) >= new Date()
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {new Date(c.due_date) >= new Date()
                    ? "active"
                    : "expired"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
