import { formatAmount } from "../../utils/formatAmount";

interface CurrencyCardProps {
  currency: string;
  symbol: string;
  amount: number;
}

const accentColors: Record<string, string> = {
  ARS: "#E24B4A",
  USD: "#1D9E75",
  EUR: "#378ADD",
  USDT: "#639922",
  BRL: "#BA7517",
};

const currencyFlags: Record<string, string> = {
  ARS: "🇦🇷",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  BRL: "🇧🇷",
  USDT: "₮",
};

const fallbackAccent = "#94A3B8";

export default function CurrencyCard({ currency, symbol, amount }: CurrencyCardProps) {
  const accent = accentColors[currency] ?? fallbackAccent;
  const flag = currencyFlags[currency] ?? "";
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return (
    <div
      className="bg-white border rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md"
      style={{
        borderTop: `3px solid ${accent}`,
        borderColor: `${accent}55`,
        padding: "0.75rem 0.5rem 0.625rem",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: accent }}
        >
          {currency}
        </span>
        <span className="text-base leading-none">{flag}</span>
      </div>
      <p
        className="text-[15px] font-medium text-black"
        style={{ whiteSpace: "nowrap", lineHeight: 1.2 }}
      >
        {formatAmount(safeAmount, symbol)}
      </p>
      <p className="mt-1 text-[11px] text-neutral-400">
        Saldo disponible
      </p>
    </div>
  );
}
