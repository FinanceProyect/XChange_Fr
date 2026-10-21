import { useEffect, useState } from "react"
import { KeyRound, X, Eye, EyeOff } from "lucide-react"
import { cambiarPassword } from "../../services/user.service"
import { showToast } from "../../lib/toastBus"

interface Props {
  onClose: () => void
}

export default function ChangePasswordModal({ onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handle)
    return () => document.removeEventListener("keydown", handle)
  }, [onClose])

  async function handleConfirm() {
    if (!currentPassword.trim() || !newPassword.trim() || !newPasswordConfirmation.trim()) {
      setError("Completá los tres campos")
      return
    }
    if (newPassword !== newPasswordConfirmation) {
      setError("La nueva contraseña y su repetición no coinciden")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await cambiarPassword({ currentPassword, newPassword, newPasswordConfirmation })
      showToast({ message: "Contraseña actualizada", variant: "success" })
      onClose()
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number; data?: { error?: string } } })?.response
      if (response?.status === 403) {
        setError("Contraseña actual incorrecta")
      } else if (response?.status === 400) {
        setError(response.data?.error ?? "La nueva contraseña no es válida")
      } else {
        setError("Error al cambiar la contraseña. Intentá de nuevo.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    "h-9 w-full px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center py-[44px] px-5 overflow-y-auto bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-xl">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Cambiar contraseña</h2>
              <p className="text-sm text-gray-500">Actualizá tu contraseña de acceso</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña actual *</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                className={`${inputClass} pr-10`}
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setError(null) }}
                autoFocus
                autoComplete="current-password"
                placeholder="Tu contraseña actual"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nueva contraseña *</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                className={`${inputClass} pr-10`}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(null) }}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres, una mayúscula y un número"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Repetir nueva contraseña *</label>
            <input
              type={showNew ? "text" : "password"}
              className={inputClass}
              value={newPasswordConfirmation}
              onChange={(e) => { setNewPasswordConfirmation(e.target.value); setError(null) }}
              onKeyDown={(e) => { if (e.key === "Enter") handleConfirm() }}
              autoComplete="new-password"
              placeholder="Repetí la nueva contraseña"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="h-9 px-5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </div>
      </div>
    </div>
  )
}
