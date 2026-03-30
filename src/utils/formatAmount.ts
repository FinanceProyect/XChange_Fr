export function formatAmount(amount: number, symbol: string): string {
  const abs = Math.abs(amount);

  if (abs >= 1_000_000_000) {
    const formatted =
      (amount / 1_000_000_000).toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "B";
    return `${symbol}${formatted}`;
  }

  if (abs >= 1_000_000) {
    const formatted =
      (amount / 1_000_000).toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "M";
    return `${symbol}${formatted}`;
  }

  const formatted = amount.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}
