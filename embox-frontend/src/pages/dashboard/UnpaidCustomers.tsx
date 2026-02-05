import { useEffect, useState } from "react"
import { fetchCustomers, updateInscriptionDate } from "../../api/customers"
import { useNavigate } from "react-router-dom"
import { formatDateShort } from "../../utils/formatDate"

export default function UnpaidCustomers() {

  const navigate = useNavigate()

  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  )

  const [toast, setToast] = useState("")

  /* ====================== */
  const loadCustomers = async () => {
    const data = await fetchCustomers()

    const today = new Date()

    const unpaid = data.filter(
      (c) => new Date(c.due_date) < today
    )

    setCustomers(unpaid)
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  /* ====================== */
  const handleConfirmPayment = async () => {

    await updateInscriptionDate(
      selectedCustomer.id,
      paymentDate
    )

    setSelectedCustomer(null)

    setToast("Pago registrado correctamente")

    await loadCustomers()

    setTimeout(() => setToast(""), 3000)
  }

  return (
    <div className="space-y-6">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded shadow-2xl z-50">
          ✔ {toast}
        </div>
      )}

      {/* BOTÓN VOLVER */}
      <button
        onClick={() => navigate("/dashboard")}
        className="text-gray-400 hover:text-white"
      >
        ← Volver al Dashboard
      </button>

      <h1 className="text-2xl font-bold text-white">
        Afiliados pendientes de pago
      </h1>

      {/* TABLA */}
      <div className="bg-black border border-zinc-800 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-gray-300">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Vence</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-zinc-800">
                <td className="p-3">{c.full_name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.plan_name}</td>
                <td className="p-3 text-red-500 font-semibold">
                  {formatDateShort(c.due_date)}
                </td>

                {/* BOTÓN PAGÓ */}
                <td className="p-3">
                  <button
                    onClick={() => setSelectedCustomer(c)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    ✔ Pagó
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= PANEL SOLIDO ================= */}
      {selectedCustomer && (
        <div className="fixed top-24 right-8 bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-2xl w-[320px] z-50">

          <h2 className="text-lg font-bold text-white mb-4">
            Confirmar pago
          </h2>

          <p className="text-gray-300 text-sm mb-4">
            {selectedCustomer.full_name}
          </p>

          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white mb-5"
          />

          <div className="flex justify-end gap-3">

            <button
              onClick={() => setSelectedCustomer(null)}
              className="px-3 py-2 text-gray-300 hover:text-white border border-gray-600 rounded"
            >
              Cancelar
            </button>

            {/* BOTÓN CONFIRMAR */}
            <button
              onClick={handleConfirmPayment}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Confirmar
            </button>

          </div>

        </div>
      )}

    </div>
  )
}
