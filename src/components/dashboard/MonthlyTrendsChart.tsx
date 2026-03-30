import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BalanceSnapshotPoint } from "../../adapters/balanceSnapshot.adapter";
import { useBalanceSnapshots } from "../../queries/dashboard.query";

type CurrencyKey = "EUR" | "USD" | "BRL" | "USDT";

const currencySeries: { key: CurrencyKey; label: string; color: string }[] = [
  { key: "EUR", label: "EUR", color: "#1d4ed8" },
  { key: "USD", label: "USD", color: "#15803d" },
  { key: "BRL", label: "BRL", color: "#a16207" },
  { key: "USDT", label: "USDT", color: "#0f766e" },
];

const tooltipFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const axisFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatCurrency = (value?: number) => tooltipFormatter.format(value ?? 0);
const formatAxisValue = (value: number) => axisFormatter.format(value);

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: BalanceSnapshotPoint }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload as BalanceSnapshotPoint;
  const displayLabel = label ?? data.hourLabel;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-gray-500">{displayLabel}</p>
      <p className="text-sm font-semibold text-gray-900 mb-2">
        Total: {formatCurrency(data.total)}
      </p>
      <div className="flex flex-col gap-1">
        {currencySeries.map(({ key, label: currencyLabel, color }) => (
          <div
            key={key}
            className="flex items-center justify-between text-xs text-gray-600"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{currencyLabel}</span>
            </div>
            <span className="font-semibold text-gray-900">
              {formatCurrency(data[key])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function MonthlyTrendsChart() {
  const { data: snapshots = [], isLoading } = useBalanceSnapshots();
  const chartData = snapshots.slice(-24);
  const hasData = chartData.length > 0;
  const totals = hasData ? chartData.map((point) => point.total) : [];
  const minTotal = hasData ? Math.min(...totals) : 0;
  const maxTotal = hasData ? Math.max(...totals) : 0;
  const padding = hasData
    ? Math.max(500, Math.round((maxTotal - minTotal) * 0.1))
    : 0;
  const domain: [number, number] = hasData
    ? [Math.max(0, minTotal - padding), maxTotal + padding]
    : [0, 1];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">
        Balance horario (24h)
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={hasData ? chartData : []}
          margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="hourLabel"
            tick={{ fontSize: 10, fill: "#6b7280" }}
            interval={1}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={(value) => formatAxisValue(value as number)}
            domain={domain}
          />
          {!isLoading && hasData && (
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#d1d5db", strokeDasharray: "5 5" }}
            />
          )}
          {hasData && (
            <Line
              type="monotone"
              dataKey="total"
              name="Balance total"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
