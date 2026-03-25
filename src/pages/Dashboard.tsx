import BalanceAlertOverlay from "../components/ui/BalanceAlertOverlay";
import StatsCard from "../components/dashboard/StatsCard";
import CurrencyCardGrid from "../components/dashboard/CurrencyCardGrid";
import PortfolioChart from "../components/dashboard/PortfolioChart";
import RecentOperations from "../components/dashboard/RecentOperations";
import { totalBalanceCard, currencyBalances } from "../data/mockData";
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

type CurrencyBalance = (typeof currencyBalances)[number];

const isCurrencyBalanceArray = (value: unknown): value is CurrencyBalance[] =>
  Array.isArray(value);

export default function Dashboard() {
  const { data } = useDashboardStats();
  const { data: remoteBalances } = useDashboardCurrencyBalances();
  const stats = data as DashboardStats | undefined;

  const baseBalances = isCurrencyBalanceArray(remoteBalances)
    ? remoteBalances
    : currencyBalances;

  // Orden personalizado: ARS, USD, EUR, USDT, BRL (ARS siempre primero si existe)
  const currencyOrder = ["ARS", "USD", "EUR", "USDT", "BRL"];
  // Si no existe ARS, lo agregamos con amount 0
  const hasARS = baseBalances.some((b) => b.currency === "ARS");
  const balancesWithARS = hasARS
    ? baseBalances
    : [{ currency: "ARS", symbol: "$AR", amount: 0 }, ...baseBalances];
  const balances = balancesWithARS.slice().sort((a, b) => {
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

  const showBalanceAlert = balances.length === 0 || totalFromCards <= 0;

  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">

      {/* Header y balance total alineados horizontalmente */}
      <div className="flex flex-col gap-2 mb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
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
