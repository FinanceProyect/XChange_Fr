import { useState } from "react";
import { Search } from "lucide-react";
import Pagination from "../ui/Pagination";
import EditDebtorModal from "./EditDebtorModal";
import { useDeudores, usePagarDeudor } from "../../queries/deudores.query";
import {
  deudorToFrontend,
  type BackendDeudor,
  type Debtor,
} from "../../adapters/deudores.adapter";
import { showToast } from "../../lib/toastBus";
import {
  formatDateValue,
  formatTimeValue,
  parseDateValue,
} from "../../utils/date";
import MarkAsPaidButton from "./MarkAsPaidButton";

const parseAmount = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const sanitized = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(sanitized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const CURRENCY_COLORS: Record<string, string> = {
  ARS:     'bg-sky-100 text-sky-700',
  PTRANS:  'bg-violet-100 text-violet-700',
  EUR:   'bg-blue-100 text-blue-700',
  USD:   'bg-green-100 text-green-700',
  BRL:   'bg-yellow-100 text-yellow-700',
  USDT:  'bg-purple-100 text-purple-700',
  METAL: 'bg-amber-100 text-amber-700',
}

const PAGE_SIZE = 8;

export default function DebtorsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editingDebtor, setEditingDebtor] = useState<Debtor | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const { data, isLoading } = useDeudores();
  const { mutate: pagarDeudor, isPending: isPaying } = usePagarDeudor();

  const debtors: Debtor[] = (Array.isArray(data) ? (data as BackendDeudor[]) : [])
    .flatMap(deudorToFrontend)
    .sort((a, b) => parseDateValue(b.date) - parseDateValue(a.date));

  const filtered = debtors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const emptyRows = Math.max(0, PAGE_SIZE - paginated.length);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleMarkAsPaid = (debtor: Debtor) => {
    const amountValue = parseAmount(debtor.amount ?? "");

    if (amountValue <= 0) {
      showToast({
        message: "El importe pendiente no es válido",
        variant: "error",
      });
      return;
    }

    setPayingId(debtor.id);

    pagarDeudor(
      { id: debtor.deudorId ?? debtor.id, pagos: [{ moneda: debtor.moneda ?? '', monto: amountValue }] },
      {
        onSuccess: (updated) => {
          const nextState = (
            (updated as { state?: string; estado?: string } | undefined)
              ?.state ??
            (updated as { estado?: string } | undefined)?.estado ??
            ""
          ).toString();

          if (nextState.toUpperCase() === "PAGADO") {
            showToast({
              message: "El usuario ya ha pagado su deuda",
              variant: "success",
            });
          }
        },
        onSettled: () => setPayingId(null),
      },
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {/* Search filter */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md pl-8 pr-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {isLoading && (
          <div className="h-[484px] flex items-center justify-center">
            <p className="text-sm text-gray-400">Cargando...</p>
          </div>
        )}

        {!isLoading && (
          <>
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[100px]" />
                <col className="w-[80px]" />
                <col className="w-[220px]" />
                <col className="w-[90px]" />
                <col className="w-[130px]" />
                <col className="w-[130px]" />
                <col className="w-[70px]" />
              </colgroup>
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="text-left py-2 font-medium">Fecha</th>
                  <th className="text-left py-2 font-medium">Hora</th>
                  <th className="text-left py-2 font-medium">Nombre</th>
                  <th className="text-left py-2 font-medium">Moneda</th>
                  <th className="text-left py-2 font-medium">Importe</th>
                  <th className="text-left py-2 font-medium pl-6">Estado</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {paginated.map((debtor) => (
                  <tr
                    key={debtor.id}
                    onClick={() => {
                      if (debtor.status === "Paid") return;
                      setEditingDebtor(debtor);
                    }}
                    className={`h-14 align-middle border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      debtor.status === "Paid"
                        ? "cursor-default"
                        : "cursor-pointer"
                    }`}
                  >
                    <td className="py-3 text-gray-600">
                      {formatDateValue(debtor.date)}
                    </td>
                    <td className="py-3 text-gray-600">
                      {formatTimeValue(debtor.date)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          {debtor.avatar}
                        </div>
                        <span className="text-gray-800 font-medium">
                          {debtor.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      {debtor.moneda ? (
                        <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${CURRENCY_COLORS[debtor.moneda] ?? 'bg-gray-100 text-gray-600'}`}>
                          {debtor.moneda}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 font-medium text-green-600">
                      {debtor.amount || "—"}
                    </td>
                    <td className="py-3 pl-6">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          debtor.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {debtor.status === "Paid" ? "Pagado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <MarkAsPaidButton
                        disabled={debtor.status === "Paid"}
                        loading={isPaying && payingId === debtor.id}
                        onConfirm={() => handleMarkAsPaid(debtor)}
                      />
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 ? (
                  <tr aria-hidden>
                    <td colSpan={7} className="h-[448px] text-center align-middle text-sm text-gray-400">
                      No se encontraron resultados
                    </td>
                  </tr>
                ) : (
                  emptyRows > 0 &&
                  Array.from({ length: emptyRows }).map((_, index) => (
                    <tr
                      key={`placeholder-${index}`}
                      className="h-14 align-middle border-b border-gray-50"
                      aria-hidden
                    >
                      <td className="py-3" colSpan={7}>
                        <span className="opacity-0">placeholder</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">
                {filtered.length === 0
                  ? "Sin resultados"
                  : `Mostrando ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} de ${filtered.length} resultados`}
              </p>
              <Pagination
                current={currentPage}
                total={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {editingDebtor && (
        <EditDebtorModal
          debtor={editingDebtor}
          onClose={() => setEditingDebtor(null)}
          onSave={() => setEditingDebtor(null)}
        />
      )}
    </>
  );
}
