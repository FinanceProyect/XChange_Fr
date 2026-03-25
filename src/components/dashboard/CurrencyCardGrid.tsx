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
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-[10px]">
      {balances.map((b) => (
        <CurrencyCard key={b.currency} {...b} />
      ))}
    </div>
  );
}
