import { useEffect, useState } from "react"
import {
  fetchCustomers,
  inactivateCustomer,
  updateInscriptionDate
} from "../../api/customers"
import { useNavigate } from "react-router-dom"
import { formatDateShort } from "../../utils/formatDate"

export default function AllCustomers() {

  const navigate = useNavigate()

  const [customers, setCustomers] = useState<any[]>([])
  const [search, setSearch] = useState("")
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

    const activeCustomers = data.filter(c => c.status === "active")

    setCustomers(activeCustomers)
    setCurrentPage(1)
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  /* ================= INACTIVATE ================= */
  const handleInactivate = async (id: string) => {

    const confirmAction = window.confirm(
      "¿Deseas marcar este afiliado como inactivo?"
    )

    if (!confirmAction) return

    await inactivateCustomer(id)
    await loadCustomers()
  }

  /* ================= EDIT SAVE ================= */
  const handleSaveEdit = async () => {

    await updateInscriptionDate(
      selectedCustomer.id,
      paymentDate,
      planName,
      manualDueDate || null
    )

    setSelectedCustomer(null)
    setManualDueDate("")
    setPlanName("Mensual")
    setToast("Afiliado actualizado correctamente")

    await loadCustomers()

    setTimeout(() => setToast(""), 3000)
  }

  /* ================= FILTER ================= */
  const filtered = customers.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  /* ================= PAGINATED DATA ================= */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated = filtered.slice(
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
        Todos los afiliados
      </h1>

      <input
        type="text"
        placeholder="Buscar por nombre o teléfono"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setCurrentPage(1)
        }}
        className="w-full max-w-sm p-2 rounded bg-black border border-zinc-700 text-white"
      />

      {/* TABLA */}
      <div className="bg-black border border-zinc-800 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-gray-300">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Vence</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((c) => (
              <tr key={c.id} className="border-t border-zinc-800">
                <td className="p-3">{c.full_name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.plan_name}</td>
                <td className="p-3">{formatDateShort(c.due_date)}</td>

                {/* STATUS */}
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

                {/* ACCIONES */}
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCustomer(c)
                      setPlanName(c.plan_name || "Mensual")
                      setPaymentDate(
                        new Date().toISOString().split("T")[0]
                      )
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleInactivate(c.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Inactivar
                  </button>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-400"
                >
                  No se encontraron afiliados
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

      {/* PANEL EDITAR */}
      {selectedCustomer && (
        <div className="fixed top-24 right-8 bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-2xl w-[320px] z-50">

          <h2 className="text-lg font-bold text-white mb-4">
            Editar afiliado
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
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
          </div>

        </div>
      )}

    </div>
  )
}
