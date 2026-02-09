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

  const [planName, setPlanName] = useState("Mensual")
  const [manualDueDate, setManualDueDate] = useState("")

  const [toast, setToast] = useState("")

  /* ================= PAGINATION ================= */
  const ITEMS_PER_PAGE = 10
  const [currentPage, setCurrentPage] = useState(1)

  /* ================= LOAD CUSTOMERS ================= */
  const loadCustomers = async () => {

    const data = await fetchCustomers()
    const today = new Date()

    const unpaid = data.filter(
      (c) =>
        (c.status || "active") === "active" &&
        new Date(c.due_date) < today
    )

    setCustomers(unpaid)
    setCurrentPage(1)
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  /* ================= CONFIRM PAYMENT ================= */
  const handleConfirmPayment = async () => {

    await updateInscriptionDate(
      selectedCustomer.id,
      paymentDate,
      planName,
      manualDueDate || null
    )

    setSelectedCustomer(null)
    setManualDueDate("")
    setPlanName("Mensual")
    setToast("Pago registrado correctamente")

    await loadCustomers()

    setTimeout(() => setToast(""), 3000)
  }

  /* ================= PAGINATED DATA ================= */
  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE)

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated = customers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

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
            {paginated.map((c) => (
              <tr key={c.id} className="border-t border-zinc-800">
                <td className="p-3">{c.full_name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.plan_name}</td>

                <td className="p-3 text-red-500 font-semibold">
                  {formatDateShort(c.due_date)}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => {
                      setSelectedCustomer(c)
                      setPlanName(c.plan_name || "Mensual")
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    ✔ Pagó
                  </button>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-400"
                >
                  No hay afiliados pendientes de pago
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-gray-300">
          <span>
            Página {currentPage} de {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-40"
            >
              Anterior
            </button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* PANEL CONFIRM PAYMENT */}
      {selectedCustomer && (
        <div className="fixed top-24 right-8 bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-2xl w-[320px] z-50">

          <h2 className="text-lg font-bold text-white mb-4">
            Confirmar pago
          </h2>

          <p className="text-gray-300 text-sm mb-4">
            {selectedCustomer.full_name}
          </p>

          {/* Fecha de pago */}
          <label className="text-sm text-gray-400">Fecha de pago</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white mb-3"
          />

          {/* Plan */}
          <label className="text-sm text-gray-400">Plan</label>
          <select
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white mb-3"
          >
            <option value="Mensual">Mensual</option>
            <option value="Bimestral">Bimestral</option>
            <option value="Trimestral">Trimestral</option>
          </select>

          {/* Fecha manual */}
          <label className="text-sm text-gray-400">
            Fecha de vencimiento manual (opcional)
          </label>
          <input
            type="date"
            value={manualDueDate}
            onChange={(e) => setManualDueDate(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white mb-5"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="px-3 py-2 text-gray-300 hover:text-white border border-gray-600 rounded"
            >
              Cancelar
            </button>

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
