import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchCustomers } from "../../api/customers"

export default function Dashboard() {
  const navigate = useNavigate()

  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCustomers()
        setCustomers(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const total = customers.length
  const today = new Date()

const unpaid = customers.filter(
  (c) => new Date(c.due_date) < today
).length


  if (loading) {
    return <div className="text-white">Cargando dashboard...</div>
  }

  return (
    <div className="space-y-8">

      {/* TITULO */}
      <h1 className="text-3xl font-bold text-white">
        Dashboard
      </h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* TOTAL AFILIADOS */}
        <div
          onClick={() => navigate("/dashboard/all")}
          className="cursor-pointer bg-green-600 hover:bg-green-700 p-6 rounded-xl shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-white">
            Total Asociados
          </h2>

          <p className="text-5xl font-bold text-white mt-4">
            {total}
          </p>
        </div>

        {/* NO HAN PAGADO */}
        <div
          onClick={() => navigate("/dashboard/unpaid")}
          className="cursor-pointer bg-red-600 hover:bg-red-700 p-6 rounded-xl shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-white">
            Pendientes de Pago
          </h2>

          <p className="text-5xl font-bold text-white mt-4">
            {unpaid}
          </p>
        </div>

      </div>
    </div>
  )
}
