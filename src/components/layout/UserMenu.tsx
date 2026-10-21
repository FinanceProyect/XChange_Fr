import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { KeyRound, LogOut } from "lucide-react"
import { useAuth } from "../../context/useAuth"
import ChangePasswordModal from "./ChangePasswordModal"

export default function UserMenu() {
  const { username, role, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const inicial = username?.[0]?.toUpperCase() ?? "?"
  const esAdmin = role === "ADMIN"

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  async function handleLogout() {
    setOpen(false)
    await logout()
    queryClient.clear()
    navigate("/login")
  }

  function handleOpenPasswordModal() {
    setOpen(false)
    setShowPasswordModal(true)
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
          {inicial}
        </span>
        <span className="text-sm font-semibold text-gray-700">{username}</span>
        {esAdmin && (
          <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700">
            ADMIN
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 z-50 min-w-[208px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">{username}</p>
              <p className="text-xs text-gray-500">{role ?? ""}</p>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={handleOpenPasswordModal}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <KeyRound size={15} />
              Cambiar contraseña
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={15} />
              Cerrar sesión
            </button>
          </div>
        </>
      )}

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  )
}
