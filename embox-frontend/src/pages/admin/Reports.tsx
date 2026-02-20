import { useState } from "react"
import axios from "axios"
import { getToken } from "../../services/auth"

export default function Reports() {

  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const formatDate = (d: Date) => d.toISOString().split("T")[0]

  const [startDate, setStartDate] = useState(formatDate(firstDay))
  const [endDate, setEndDate] = useState(formatDate(lastDay))

  const downloadFile = async (url: string, filename: string) => {
    const token = getToken()

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: "blob"
    })

    const blob = new Blob([response.data])
    const link = document.createElement("a")
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  /* ================= AFILIADOS ================= */

  const handleExportCustomersPDF = async () => {
    const url = `http://localhost:3000/reports/customers/pdf`
    await downloadFile(url, "reporte_afiliados.pdf")
  }

  /* ================= FINANCIERO ================= */

  const handleExportExcel = async () => {
    const url = `http://localhost:3000/reports/finance/excel?start=${startDate}&end=${endDate}`
    await downloadFile(url, "reporte_financiero.xlsx")
  }

  const handleExportPDF = async () => {
    const url = `http://localhost:3000/reports/finance/pdf?start=${startDate}&end=${endDate}`
    await downloadFile(url, "reporte_financiero.pdf")
  }

  return (
    <div className="space-y-10">

      {/* ================================= */}
      {/* 🔥 REPORTE DE AFILIADOS */}
      {/* ================================= */}

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">
          Reporte de Afiliados
        </h1>

        <div className="flex gap-4">
          <button
            onClick={handleExportCustomersPDF}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Descargar PDF Afiliados
          </button>
        </div>
      </div>

      {/* ================================= */}
      {/* 📊 REPORTE FINANCIERO */}
      {/* ================================= */}

      <div className="space-y-8">

        <h1 className="text-2xl font-bold text-white">
          Reportes financieros
        </h1>

        <div className="bg-black border border-zinc-800 rounded p-6 flex flex-col md:flex-row gap-4 items-end">

          <div>
            <label className="text-xs text-gray-400">
              Desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block p-2 rounded bg-black border border-zinc-700 text-white"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400">
              Hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block p-2 rounded bg-black border border-zinc-700 text-white"
            />
          </div>

        </div>

        <div className="flex gap-4">

          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Descargar Excel
          </button>

          <button
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Descargar PDF
          </button>

        </div>

      </div>

    </div>
  )
}
