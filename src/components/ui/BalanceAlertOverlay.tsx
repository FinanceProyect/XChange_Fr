import { useNavigate } from "react-router-dom";

interface BalanceAlertOverlayProps {
  settingsPath?: string;
}

export default function BalanceAlertOverlay({
  settingsPath = "/settings",
}: BalanceAlertOverlayProps) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-[4px] transition-all animate-fadein">
      <div className="flex flex-col gap-5 items-center bg-white/95 border border-red-100 rounded-2xl p-8 shadow-xl max-w-xs text-center backdrop-blur-sm">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-2 shadow-md">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
            <path
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-black">
          Saldo disponible sin configurar
        </p>
        <p className="text-sm text-black">
          Para empezar a operar, establece un saldo inicial en la sección de
          configuración.
        </p>
        <button
          type="button"
          onClick={() => navigate(settingsPath)}
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Ir a configuración
        </button>
      </div>
      <style>{`
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadein { animation: fadein 0.5s; }
      `}</style>
    </div>
  );
}
