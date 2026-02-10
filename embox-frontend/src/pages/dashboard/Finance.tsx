import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getFinanceSummary, createExpense } from "../../api/customers"

export default function Finance() {

  const navigate = useNavigate()

  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const formatDate = (d: Date) => d.toISOString().split("T")[0]

  const [startDate, setStartDate] = useState(formatDate(firstDay))
  const [endDate, setEndDate] = useState(formatDate(lastDay))

  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0
  })

  const [concept, setConcept] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  )

  const [toast, setToast] = useState("")

  /* ================= LOAD SUMMARY ================= */
  const loadSummary = async (start?: string, end?: string) => {
    const data = await getFinanceSummary(start, end)
    setSummary(data)
  }

  useEffect(() => {
    loadSummary(startDate, endDate)
  }, [])

  /* ================= CREATE EXPENSE ================= */
  const handleCreateExpense = async () => {

    if (!concept || !amount || !date) {
      setToast("Todos los campos son obligatorios")
      setTimeout(() => setToast(""), 3000)
      return
    }

    await createExpense({
      concept,
      amount: Number(amount),
      date
    })

    setConcept("")
    setAmount("")
    setDate(new Date().toISOString().split("T")[0])

    setToast("Egreso registrado correctamente")

    await loadSummary(startDate, endDate)

    setTimeout(() => setToast(""), 3000)
  }

  const handleApplyFilter = async () => {
    await loadSummary(startDate, endDate)
  }

  const formatCOP = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="space-y-8">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded shadow-2xl z-50">
          {toast}
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
        Finanzas
      </h1>

      {/* FILTRO DE FECHAS */}
      <div className="bg-black border border-zinc-800 rounded p-4 flex flex-col md:flex-row gap-6 items-end">

        {/* START DATE */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 rounded bg-black border border-zinc-700 text-white 
                       [color-scheme:dark]"
          />
          <span className="text-xs text-gray-500 mt-1">
            Formato: MM/DD/AAAA
          </span>
        </div>

        {/* END DATE */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 rounded bg-black border border-zinc-700 text-white 
                       [color-scheme:dark]"
          />
          <span className="text-xs text-gray-500 mt-1">
            Formato: MM/DD/AAAA
          </span>
        </div>

        {/* APPLY BUTTON */}
        <button
          onClick={handleApplyFilter}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded h-[42px]"
        >
          Aplicar
        </button>

      </div>

      {/* RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-green-600 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg text-white">
            Total ingresos
          </h2>
          <p className="text-3xl font-bold text-white mt-2">
            {formatCOP(summary.total_income)}
          </p>
        </div>

        <div className="bg-red-600 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg text-white">
            Total egresos
          </h2>
          <p className="text-3xl font-bold text-white mt-2">
            {formatCOP(summary.total_expense)}
          </p>
        </div>

        <div className="bg-purple-600 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg text-white">
            Balance
          </h2>
          <p className="text-3xl font-bold text-white mt-2">
            {formatCOP(summary.balance)}
          </p>
        </div>

      </div>

      {/* FORMULARIO EGRESO */}
      <div className="bg-black border border-zinc-800 rounded p-6 max-w-md">

        <h2 className="text-lg font-semibold text-white mb-4">
          Registrar egreso
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Concepto"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="w-full p-2 rounded bg-black border border-zinc-700 text-white"
          />

          <input
            type="number"
            placeholder="Valor (COP)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 rounded bg-black border border-zinc-700 text-white"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 rounded bg-black border border-zinc-700 text-white 
                       [color-scheme:dark]"
          />

          <button
            onClick={handleCreateExpense}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
          >
            Registrar egreso
          </button>

        </div>

      </div>

    </div>
  )
}
