import { useState } from "react";
import { CheckCircle, Search } from "lucide-react";
import Pagination from "../ui/Pagination";
import EditDebtorModal from "./EditDebtorModal";
import type { Debtor } from "../../data/mockData";
import { useDeudores, useSaldarDeudor } from "../../queries/deudores.query";
import {
  deudorToFrontend,
  type BackendDeudor,
} from "../../adapters/deudores.adapter";

const PAGE_SIZE = 8;

export default function DebtorsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingDebtor, setEditingDebtor] = useState<Debtor | null>(null);

  const { data, isLoading } = useDeudores();
  const { mutate: saldar } = useSaldarDeudor();

  const debtors: Debtor[] = ((data as BackendDeudor[] | undefined) ?? []).map(
    deudorToFrontend,
  );

  const filtered = debtors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Overlay to close menu on outside click */}
      {openMenuId !== null && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenMenuId(null)}
        />
      )}

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
          <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
        )}

        {!isLoading && (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="text-left py-2 font-medium">Fecha</th>
                  <th className="text-left py-2 font-medium">Nombre</th>
                  <th className="text-left py-2 font-medium">Documento</th>
                  <th className="text-left py-2 font-medium">Importe</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {paginated.map((debtor) => (
                  <tr
                    key={debtor.id}
                    onClick={() => setEditingDebtor(debtor)}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 text-gray-600">{debtor.date}</td>
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
                    <td className="py-3 text-gray-600">
                      {debtor.document ?? "—"}
                    </td>
                    <td className="py-3 font-medium text-green-600">
                      {debtor.amount || "—"}
                    </td>
                    <td className="py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === debtor.id ? null : debtor.id,
                            );
                          }}
                          className="text-green-500 hover:text-green-600 cursor-pointer transition-colors"
                        >
                          <CheckCircle size={16} />
                        </button>
                        {openMenuId === debtor.id && (
                          <div className="absolute right-0 top-6 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[170px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                saldar(debtor.id);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              Marcar como pagado
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-sm text-gray-400"
                    >
                      No se encontraron resultados
                    </td>
                  </tr>
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
