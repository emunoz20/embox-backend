import { useState } from "react"
import { createCustomer } from "../../api/customers"
import axios from "axios"

export default function Users() {
  const [openModal, setOpenModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [planName, setPlanName] = useState("Mensual")

  const today = new Date().toISOString().split("T")[0]
  const [inscriptionDate, setInscriptionDate] = useState(today)
  const [manualDueDate, setManualDueDate] = useState("")

  const handleSave = async () => {
    if (!fullName || !phone || !planName || !inscriptionDate) {
      setErrorMessage("Todos los campos obligatorios deben completarse")
      return
    }

    try {
      await createCustomer({
        full_name: fullName,
        phone,
        plan_name: planName,
        inscription_date: inscriptionDate,
        manual_due_date: manualDueDate || undefined
      })

      setSuccessMessage(true)
      setErrorMessage("")

      setFullName("")
      setPhone("")
      setPlanName("Mensual")
      setInscriptionDate(today)
      setManualDueDate("")

    } catch (error: any) {

      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setErrorMessage("Este número de teléfono ya está registrado")
        return
      }

      setErrorMessage("Error al crear afiliado")
      console.error(error)
    }
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSuccessMessage(false)
    setErrorMessage("")
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-600">
          Afiliados
        </h1>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          + Crear afiliado
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-black border border-zinc-800 rounded p-6 text-gray-400">
        Tabla de afiliados
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded w-[420px]">

            <h2 className="text-xl font-bold mb-4 text-white">
              Crear afiliado
            </h2>

            {/* ERROR */}
            {errorMessage && (
              <div className="bg-red-900/30 border border-red-600 text-red-400 p-3 rounded mb-4 text-sm">
                ⚠ {errorMessage}
              </div>
            )}

            {/* MENSAJE DE ÉXITO */}
            {successMessage && (
              <div className="flex items-center gap-3 bg-green-900/30 border border-green-600 text-green-400 p-3 rounded mb-4">
                <span className="text-2xl">✔</span>
                <span>Afiliado creado correctamente</span>
              </div>
            )}

            {/* FORM */}
            <div className="space-y-4">

              <input
                type="text"
                placeholder="Nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 rounded bg-black border border-zinc-700 text-white"
              />

              <input
                type="text"
                placeholder="Teléfono"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setErrorMessage("")
                }}
                className="w-full p-2 rounded bg-black border border-zinc-700 text-white"
              />

              {/* PLAN */}
              <select
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full p-2 rounded bg-black border border-zinc-700 text-white"
              >
                <option value="Mensual">Mensual</option>
                <option value="Bimestral">Bimestral</option>
                <option value="Trimestral">Trimestral</option>
              </select>

              {/* FECHA DE INSCRIPCIÓN */}
              <div>
                <label className="text-xs text-gray-400">
                  Fecha de inscripción
                </label>
                <input
                  type="date"
                  value={inscriptionDate}
                  onChange={(e) => setInscriptionDate(e.target.value)}
                  className="w-full p-2 rounded bg-black border border-zinc-700 text-white"
                />
              </div>

              {/* FECHA MANUAL */}
              <div>
                <label className="text-xs text-gray-400">
                  Fecha de vencimiento manual (opcional)
                </label>
                <input
                  type="date"
                  value={manualDueDate}
                  onChange={(e) => setManualDueDate(e.target.value)}
                  className="w-full p-2 rounded bg-black border border-zinc-700 text-white"
                />
              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white"
              >
                Cancelar
              </button>

              <button
                onClick={handleSave}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
