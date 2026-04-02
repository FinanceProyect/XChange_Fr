import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  usePortfolioChartData,
  type PortfolioPeriod,
} from "../../queries/dashboard.query";
import type { ChartPoint } from "../../adapters/balanceSnapshot.adapter";

const PERIODS: { key: PortfolioPeriod; label: string }[] = [
  { key: "hour", label: "Hora" },
  { key: "day", label: "Día" },
  { key: "month", label: "Mes" },
];

const axisFormatter = new Intl.NumberFormat("es-ES", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const tooltipFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const getAxisConfig = (points: ChartPoint[]) => {
  if (!points.length) return { domain: [0, 1] as [number, number] };
  const totals = points
    .map((p) => p.total)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (!totals.length) return { domain: [0, 1] as [number, number] };
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  const padding = Math.max(500, Math.round((max - min) * 0.1));
  return {
    domain: [Math.max(0, min - padding), max + padding] as [number, number],
  };
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-gray-500 mb-1">{point.label}</p>
      <p className="text-sm font-semibold text-gray-900">
        {point.total !== null ? tooltipFormatter.format(point.total) : "—"}
      </p>
    </div>
  );
};

export default function PortfolioChart() {
  const [period, setPeriod] = useState<PortfolioPeriod>("hour");
  const { data, isLoading, isFetching, refetch } = usePortfolioChartData(period);

  const hasData = data.some((p) => p.total !== null);
  const { domain } = getAxisConfig(data);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-gray-800">
          Evolución de la cartera
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Actualizar ahora"
            className="p-1.5 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                period === key
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Actualizado automáticamente cada 15 min
      </p>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Cargando datos...</p>
        </div>
      )}

      {!isLoading && !hasData && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">
            Aún no hay datos para este período.
          </p>
        </div>
      )}

      {!isLoading && hasData && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              interval={period === "hour" ? 7 : "preserveStartEnd"}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickFormatter={(v) => axisFormatter.format(v as number)}
              tickLine={false}
              axisLine={false}
              width={52}
              domain={domain}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#d1d5db", strokeDasharray: "5 5" }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#0f172a"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={true}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
