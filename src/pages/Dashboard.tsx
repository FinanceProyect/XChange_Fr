import BalanceAlertOverlay from "../components/ui/BalanceAlertOverlay";
import StatsCard from "../components/dashboard/StatsCard";
import CurrencyCardGrid from "../components/dashboard/CurrencyCardGrid";
import PortfolioChart from "../components/dashboard/PortfolioChart";
import RecentOperations from "../components/dashboard/RecentOperations";
import { totalBalanceCard } from "../data/mockData";
import {
  useDashboardStats,
  useBalanceSummary,
} from "../queries/dashboard.query";
import type { BackendOperacion } from "../adapters/operaciones.adapter";
import { balancesResponseToCards } from "../adapters/balance.adapter";

interface DashboardStats {
  recentOperations: BackendOperacion[];
  balanceTotal?: number;
}

export default function Dashboard() {
  const { data: statsData } = useDashboardStats();
  const stats = statsData as DashboardStats | undefined;

  // Usar el nuevo hook para obtener balances y balanceTotal
  const { data: balanceSummary } = useBalanceSummary();
  // Adaptar balances del backend al formato esperado por las cards
  const balances = Array.isArray(balanceSummary?.balances)
    ? balancesResponseToCards(balanceSummary.balances)
    : [];
  const balanceTotal =
    typeof balanceSummary?.balanceTotal === "number"
      ? balanceSummary.balanceTotal
      : undefined;

  // Mostrar balanceTotal del backend directamente
  const totalBalanceValue =
    typeof balanceTotal === "number"
      ? `$${balanceTotal.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : totalBalanceCard.value;

  const totalCard = {
    ...totalBalanceCard,
    value: totalBalanceValue,
  };

  // Mostrar overlay solo si balances NO está vacío y TODOS los saldos están en cero
  // Mostrar overlay solo si balances NO está vacío y TODOS los saldos están en cero
  const showBalanceAlert =
    Array.isArray(balances) &&
    balances.length > 0 &&
    balances.every((b) => b.amount === 0);

  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">
      {/* Header y balance total alineados horizontalmente */}
      <div className="flex flex-col gap-2 mb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">
            Welcome back! Here's your financial overview.
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
