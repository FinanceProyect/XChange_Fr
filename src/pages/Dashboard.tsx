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
  totalBalanceTrend: string;
  trendUp: boolean;
  recentOperations: BackendOperacion[];
}

export default function Dashboard() {
  const { data } = useDashboardStats();
  const { data: remoteBalances } = useDashboardCurrencyBalances();
  const stats = data as DashboardStats | undefined;

  // Solo usar datos reales del backend
  const baseBalances =
    Array.isArray(remoteBalances) && remoteBalances.length > 0
      ? remoteBalances
      : [];

  // Orden personalizado: ARS, USD, EUR, USDT, BRL (ARS siempre primero si existe)
  const currencyOrder = ["ARS", "USD", "EUR", "USDT", "BRL"];
  // Solo mostrar las monedas que devuelve el backend (o mocks si no hay datos)
  const balances = baseBalances.slice().sort((a, b) => {
    const idxA = currencyOrder.indexOf(a.currency);
    const idxB = currencyOrder.indexOf(b.currency);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  const totalFromCards = balances.reduce((acc, balance) => {
    const amount =
      typeof balance.amount === "number"
        ? balance.amount
        : Number(balance.amount ?? 0);
    if (Number.isNaN(amount)) return acc;
    return acc + amount;
  }, 0);

  const totalFromCardsValue = balances.length
    ? `$${totalFromCards.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : undefined;
  const totalCard = {
    ...totalBalanceCard,
    value: totalFromCardsValue ?? totalBalanceCard.value,
    trend: stats?.totalBalanceTrend ?? totalBalanceCard.trend,
    trendUp: stats?.trendUp ?? totalBalanceCard.trendUp,
  };

  // Mostrar overlay solo si todos los saldos están en cero y balances no está vacío
  const showBalanceAlert =
    Array.isArray(remoteBalances) &&
    remoteBalances.length > 0 &&
    remoteBalances.every(
      (b) =>
        (typeof b.amount === "number" ? b.amount : Number(b.amount ?? 0)) === 0,
    );

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
