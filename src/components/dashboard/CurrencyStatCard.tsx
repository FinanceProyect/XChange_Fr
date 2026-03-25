interface CurrencyStatCardProps {
  currency: string;
  symbol: string;
  amount: number;
}

type Palette = {
  panel: string;
  border: string;
  accent: string;
  accentSoft: string;
  badge: string;
  badgeText: string;
  glow: string;
  dot: string;
};

const colorMap: Record<string, Palette> = {
  ARS: {
    panel: "bg-white",
    border: "border-rose-200",
    accent: "text-rose-600",
    accentSoft: "",
    badge: "",
    badgeText: "",
    glow: "",
    dot: "bg-rose-500",
  },
  USD: {
    panel: "bg-white",
    border: "border-emerald-200",
    accent: "text-emerald-600",
    accentSoft: "",
    badge: "",
    badgeText: "",
    glow: "",
    dot: "bg-emerald-500",
  },
  EUR: {
    panel: "bg-white",
    border: "border-blue-200",
    accent: "text-blue-600",
    accentSoft: "",
    badge: "",
    badgeText: "",
    glow: "",
    dot: "bg-blue-500",
  },
  BRL: {
    panel: "bg-white",
    border: "border-amber-200",
    accent: "text-amber-600",
    accentSoft: "",
    badge: "",
    badgeText: "",
    glow: "",
    dot: "bg-amber-500",
  },
  USDT: {
    panel: "bg-white",
    border: "border-purple-200",
    accent: "text-purple-600",
    accentSoft: "",
    badge: "",
    badgeText: "",
    glow: "",
    dot: "bg-purple-500",
  },
};

const fallback: Palette = {
  panel: "bg-white",
  border: "border-gray-200",
  accent: "text-slate-500",
  accentSoft: "",
  badge: "",
  badgeText: "",
  glow: "",
  dot: "bg-gray-400",
};

export default function CurrencyStatCard({
  currency,
  symbol,
  amount,
}: CurrencyStatCardProps) {
  const palette = colorMap[currency] ?? fallback;
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return (
    <div
      className={`overflow-hidden rounded-xl border ${palette.border} ${palette.panel} px-3 py-2`}
    >
      <div>
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${palette.accent}`}
        >
          {currency}
        </p>
        <p className="mt-1.5 text-xl font-semibold text-slate-900">
          {symbol}
          {safeAmount.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">Saldo disponible</p>
      </div>
    </div>
  );
}
