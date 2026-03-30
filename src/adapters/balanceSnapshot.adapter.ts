const formatter = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const formatHourLabel = (isoDate: string | null | undefined) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return formatter.format(date);
};

export interface BackendBalanceSnapshot {
  balanceTotal?: unknown;
  euro?: unknown;
  EUR?: unknown;
  USD?: unknown;
  usd?: unknown;
  BRL?: unknown;
  USDT?: unknown;
  ars?: unknown;
  fecha?: unknown;
}

export interface BalanceSnapshotPoint {
  timestamp: string;
  hourLabel: string;
  total: number;
  EUR: number;
  USD: number;
  BRL: number;
  USDT: number;
  ARS: number;
}

const toBalanceSnapshotPoint = (
  snapshot: BackendBalanceSnapshot,
): BalanceSnapshotPoint | null => {
  const total = toNumber(snapshot.balanceTotal);
  const eur = toNumber(snapshot.EUR ?? snapshot.euro);
  const usd = toNumber(snapshot.USD ?? snapshot.usd);
  const brl = toNumber(snapshot.BRL);
  const usdt = toNumber(snapshot.USDT);
  const ars = toNumber(snapshot.ars) ?? 0;
  const fecha = typeof snapshot.fecha === "string" ? snapshot.fecha : null;

  if (
    total === null ||
    eur === null ||
    usd === null ||
    brl === null ||
    usdt === null ||
    !fecha
  ) {
    return null;
  }

  return {
    timestamp: fecha,
    hourLabel: formatHourLabel(fecha),
    total,
    EUR: eur,
    USD: usd,
    BRL: brl,
    USDT: usdt,
    ARS: ars,
  };
};

export const balanceSnapshotsResponseToPoints = (
  payload: unknown,
): BalanceSnapshotPoint[] => {
  if (!Array.isArray(payload)) return [];
  return payload
    .map((item) => toBalanceSnapshotPoint(item as BackendBalanceSnapshot))
    .filter((item): item is BalanceSnapshotPoint => Boolean(item))
    .sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
};
