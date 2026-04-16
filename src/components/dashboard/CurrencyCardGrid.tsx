import CurrencyCard from "./CurrencyCard";

interface CurrencyBalance {
  currency: string;
  symbol: string;
  amount: number;
}

interface CurrencyCardGridProps {
  balances: CurrencyBalance[];
}

export default function CurrencyCardGrid({ balances }: CurrencyCardGridProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {balances.map((b) => (
        <CurrencyCard key={b.currency} {...b} />
      ))}
    </div>
  );
}
