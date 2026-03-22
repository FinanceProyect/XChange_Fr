import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import type { BalanceSnapshotPoint } from "../../adapters/balanceSnapshot.adapter";
import { useBalanceSnapshots } from "../../queries/dashboard.query";

const HOURS = Array.from(
  { length: 24 },
  (_, index) => `${index.toString().padStart(2, "0")}:00`,
);

type CurrencyKey = "EUR" | "USD" | "BRL" | "USDT";

const currencyMeta: Record<CurrencyKey, { label: string; color: string }> = {
  EUR: { label: "€ EUR", color: "#3b82f6" },
  USD: { label: "$ USD", color: "#22c55e" },
  BRL: { label: "R$ BRL", color: "#eab308" },
  USDT: { label: "₮ USDT", color: "#a855f7" },
};

const tooltipFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatCurrencyAmount = (value: number) => {
  if (!Number.isFinite(value)) return "0";
  return Math.trunc(value).toString();
};

const AXIS_STEP = 10_000;
const MIN_TICKS = 4;

const getAxisConfig = (points: BalanceSnapshotPoint[]) => {
  if (!points.length) {
    return {
      domain: [0, AXIS_STEP * MIN_TICKS] as [number, number],
      ticks: Array.from(
        { length: MIN_TICKS + 1 },
        (_, index) => index * AXIS_STEP,
      ),
    } as const;
  }

  const totals = points
    .map((point) => point.total)
    .filter((value) => Number.isFinite(value) && value >= 0);

  if (!totals.length) {
    return {
      domain: [0, AXIS_STEP * MIN_TICKS] as [number, number],
      ticks: Array.from(
        { length: MIN_TICKS + 1 },
        (_, index) => index * AXIS_STEP,
      ),
    } as const;
  }

  const maxValue = Math.max(...totals);
  let maxTick = Math.ceil(maxValue / AXIS_STEP) * AXIS_STEP;
  if (maxTick === 0) {
    maxTick = AXIS_STEP;
  }

  const ticks: number[] = [];
  for (let value = 0; value <= maxTick; value += AXIS_STEP) {
    ticks.push(value);
  }

  while (ticks.length < MIN_TICKS + 1) {
    maxTick += AXIS_STEP;
    ticks.push(maxTick);
  }

  const domain: [number, number] = [0, maxTick + AXIS_STEP];

  return {
    domain,
    ticks,
  } as const;
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload as BalanceSnapshotPoint;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-gray-500">{point.hourLabel}</p>
      <p className="text-sm font-semibold text-gray-900 mb-2">
        Total: {tooltipFormatter.format(point.total)}
      </p>
      <div className="flex flex-col gap-1">
        {(Object.keys(currencyMeta) as CurrencyKey[]).map((key) => (
          <div
            key={key}
            className="flex items-center justify-between text-xs text-gray-600"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: currencyMeta[key].color }}
              />
              <span>{currencyMeta[key].label}</span>
            </div>
            <span className="font-semibold text-gray-900">
              {formatCurrencyAmount(point[key])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatAxisValue = (value: number) => {
  if (!Number.isFinite(value)) return "";
  if (value === 0) return "0 US$";
  const amountInThousands = value / 1000;
  const formatted = new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
  }).format(amountInThousands);
  return `${formatted} mil US$`;
};

type ChartPoint = BalanceSnapshotPoint & { hasData: boolean };

const mergeSnapshotsWithHours = (
  snapshots: BalanceSnapshotPoint[],
): ChartPoint[] => {
  const map = new Map<string, BalanceSnapshotPoint>();
  snapshots.forEach((snapshot) => map.set(snapshot.hourLabel, snapshot));

  return HOURS.map((hour) => {
    const snapshot = map.get(hour);
    if (snapshot) {
      return { ...snapshot, hasData: true };
    }
    return {
      timestamp: hour,
      hourLabel: hour,
      total: Number.NaN,
      EUR: 0,
      USD: 0,
      BRL: 0,
      USDT: 0,
      hasData: false,
    };
  });
};

export default function PortfolioChart() {
  const { data: snapshots = [], isLoading } = useBalanceSnapshots();
  const chartData = mergeSnapshotsWithHours(snapshots);
  const totals = snapshots
    .map((point) => point.total)
    .filter((value) => value >= 0);
  const hasData = totals.length > 0;
  const { domain, ticks } = getAxisConfig(hasData ? snapshots : []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-gray-800">
          Portfolio Overview
        </h2>
        <p className="text-xs text-gray-500">
          Actualizado automáticamente cada hora
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-400 text-center py-12 w-full">
          Cargando balances...
        </p>
      )}

      {!isLoading && !hasData && (
        <p className="text-sm text-gray-400 text-center py-12 w-full">
          Aún no hay datos para el balance horario.
        </p>
      )}

      {!isLoading && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="hourLabel"
              ticks={HOURS}
              tick={{ fontSize: 10 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => formatAxisValue(value as number)}
              tickLine={false}
              axisLine={false}
              width={48}
              domain={domain}
              ticks={ticks}
              allowDecimals={false}
            />
            {hasData && (
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#d1d5db", strokeDasharray: "5 5" }}
              />
            )}
            {hasData && (
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0f172a"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 5 }}
                name="Balance total"
                connectNulls={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
