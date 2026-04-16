import BalanceAlertOverlay from "../components/ui/BalanceAlertOverlay";
import StatsCard from "../components/dashboard/StatsCard";
import CurrencyCardGrid from "../components/dashboard/CurrencyCardGrid";
import PortfolioChart from "../components/dashboard/PortfolioChart";
import RecentOperations from "../components/dashboard/RecentOperations";
import { totalBalanceCard } from "../data/mockData";
import {
  useDashboardStats,
  useDashboardCurrencyBalances,
} from "../queries/dashboard.query";
import type { BackendOperacion } from "../adapters/operaciones.adapter";

interface DashboardStats {
  recentOperations: BackendOperacion[];
  balanceTotal?: number;
}

export default function Dashboard() {
  const { data, isLoading: isLoadingStats } = useDashboardStats();
  const { data: balancesData, isLoading: isLoadingBalances } = useDashboardCurrencyBalances();
  const isLoading = isLoadingStats || isLoadingBalances;
  const stats = data as DashboardStats | undefined;

  const baseBalances = balancesData?.cards ?? [];
  const balanceTotal = balancesData?.balanceTotal;

  // Orden personalizado: ARS, USD, EUR, USDT, BRL (ARS siempre primero si existe)
  const currencyOrder = ["ARS", "USD", "EUR", "USDT", "BRL", "PTRANS"];
  const balances = baseBalances.slice().sort((a, b) => {
    const idxA = currencyOrder.indexOf(a.currency);
    const idxB = currencyOrder.indexOf(b.currency);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  const totalBalanceValue =
    balanceTotal !== undefined
      ? `$${balanceTotal.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : totalBalanceCard.value;

  const totalCard = {
    ...totalBalanceCard,
    value: totalBalanceValue,
  };

  // Mostrar overlay si ya cargó y no hay balances configurados o todos están en cero
  const showBalanceAlert =
    !isLoading &&
    baseBalances.length > 0 &&
    baseBalances.every(
      (b) =>
        (typeof b.amount === "number" ? b.amount : Number(b.amount ?? 0)) === 0,
    );

  if (isLoading) {
    return (
      <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6 animate-pulse">
        <div className="flex flex-col gap-2 mb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="h-7 w-36 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-56 bg-gray-200 rounded" />
          </div>
          <div className="mt-3 lg:mt-0 w-full md:max-w-xs lg:max-w-sm h-16 bg-gray-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:flex-[3] h-64 bg-gray-200 rounded-xl" />
          <div className="lg:flex-[2] h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">
      {/* Header y balance total alineados horizontalmente */}
      <div className="flex flex-col gap-2 mb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">
            ¡Bienvenido! Aquí está tu resumen financiero.
          </p>
        </div>
        <div className="mt-3 lg:mt-0 w-full md:max-w-xs lg:max-w-sm">
          <StatsCard {...totalCard} />
        </div>
      </div>

      {/* Overlay de saldo sin configurar */}
      {showBalanceAlert && <BalanceAlertOverlay />}

      {/* Monedas */}
      <div className="mb-8">
        <CurrencyCardGrid balances={balances} />
      </div>

      {/* Portfolio chart + últimas operaciones */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="lg:flex-[3] flex flex-col">
          <PortfolioChart />
        </div>
        <div className="lg:flex-[2] flex flex-col">
          <RecentOperations operations={stats?.recentOperations} />
        </div>
      </div>
    </div>
  );
}
