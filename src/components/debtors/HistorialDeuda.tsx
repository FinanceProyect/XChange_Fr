import { useMovimientosDeuda } from "../../queries/deudores.query";
import { formatDateValue, formatTimeValue } from "../../utils/date";

export interface BackendMovimientoDeuda {
  id: string;
  fechaHora: string;
  tipo: "PAGO" | "AGRANDAR";
  monto: number;
  pendienteAntes: number;
  pendienteDespues: number;
  motivo: string | null;
}

const TIPO_ETIQUETA: Record<BackendMovimientoDeuda["tipo"], string> = {
  PAGO: "Pago",
  AGRANDAR: "Agrandar",
};

const TIPO_COLOR: Record<BackendMovimientoDeuda["tipo"], string> = {
  PAGO: "bg-green-100 text-green-700",
  AGRANDAR: "bg-blue-100 text-blue-700",
};

const formatNumero = (n: number) => n.toLocaleString("es-AR", { maximumFractionDigits: 2 });

interface HistorialDeudaProps {
  deudorId: string;
  deudaId: string;
  moneda: string;
  /** Sin callback, el historial es de solo lectura (deudas saldadas) y no muestra "Pago parcial". */
  onPagarParcial?: () => void;
}

export default function HistorialDeuda({ deudorId, deudaId, moneda, onPagarParcial }: HistorialDeudaProps) {
  const { data, isLoading, isError } = useMovimientosDeuda(deudorId, deudaId, true);
  const movimientos = (Array.isArray(data) ? (data as BackendMovimientoDeuda[]) : []);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase">Historial · {moneda}</p>
        {onPagarParcial && (
          <button
            onClick={onPagarParcial}
            className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
          >
            Pago parcial
          </button>
        )}
      </div>

      {isLoading && <p className="text-xs text-gray-400">Cargando historial...</p>}
      {isError && <p className="text-xs text-red-600">No se pudo cargar el historial</p>}

      {!isLoading && !isError && movimientos.length === 0 && (
        <p className="text-xs text-gray-400">Sin movimientos</p>
      )}

      {!isLoading && !isError && movimientos.length > 0 && (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 uppercase border-b border-gray-200">
              <th className="text-left py-1.5 font-medium">Fecha</th>
              <th className="text-left py-1.5 font-medium">Hora</th>
              <th className="text-left py-1.5 font-medium">Tipo</th>
              <th className="text-right py-1.5 font-medium">Monto</th>
              <th className="text-right py-1.5 font-medium">Pendiente</th>
              <th className="text-left py-1.5 font-medium pl-4">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m) => (
              <tr key={m.id} className="border-b border-gray-100 last:border-0">
                <td className="py-1.5 text-gray-600">{formatDateValue(m.fechaHora)}</td>
                <td className="py-1.5 text-gray-600">{formatTimeValue(m.fechaHora)}</td>
                <td className="py-1.5">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${TIPO_COLOR[m.tipo]}`}>
                    {TIPO_ETIQUETA[m.tipo]}
                  </span>
                </td>
                <td className="py-1.5 text-right font-medium text-gray-800">{formatNumero(m.monto)}</td>
                <td className="py-1.5 text-right text-gray-600">
                  {formatNumero(m.pendienteAntes)} → {formatNumero(m.pendienteDespues)}
                </td>
                <td className="py-1.5 pl-4 text-gray-500">{m.motivo ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
