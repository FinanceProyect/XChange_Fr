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

export interface ChartPoint {
  label: string;
  total: number | null;
}

const padDate = (n: number) => `${n}`.padStart(2, "0");

const toDayLabel = (isoDate: string): string => {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return `${padDate(d.getDate())}/${padDate(d.getMonth() + 1)}`;
};

const toMonthLabel = (isoDate: string): string => {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleString("es-ES", { month: "short" });
};

export const buildDailyPoints = (
  entries: { date: string; snapshots: BalanceSnapshotPoint[] }[],
): ChartPoint[] => {
  return entries
    .map(({ date, snapshots }) => {
      if (!snapshots.length) return null;
      const last = snapshots[snapshots.length - 1];
      return { label: toDayLabel(date), total: last.total };
    })
    .filter((p): p is ChartPoint => p !== null);
};

export const buildMonthlyPoints = (
  entries: { date: string; snapshots: BalanceSnapshotPoint[] }[],
): ChartPoint[] => {
  const byMonth = new Map<string, ChartPoint>();
  for (const { date, snapshots } of entries) {
    if (!snapshots.length) continue;
    const last = snapshots[snapshots.length - 1];
    const monthKey = date.slice(0, 7); // "YYYY-MM"
    byMonth.set(monthKey, { label: toMonthLabel(date), total: last.total });
  }
  return Array.from(byMonth.values());
};

export const buildHourlyGridPoints = (
  snapshots: BalanceSnapshotPoint[],
): ChartPoint[] => {
  const slotMap = new Map<string, number>();
  for (const s of snapshots) {
    const d = new Date(s.timestamp);
    if (Number.isNaN(d.getTime())) continue;
    const totalMinutes = d.getHours() * 60 + d.getMinutes();
    const roundedMinutes = Math.min(Math.round(totalMinutes / 15) * 15, 23 * 60 + 45);
    const hh = `${Math.floor(roundedMinutes / 60)}`.padStart(2, "0");
    const mm = `${roundedMinutes % 60}`.padStart(2, "0");
    slotMap.set(`${hh}:${mm}`, s.total);
  }
  const points: ChartPoint[] = [];
  for (let slot = 0; slot < 96; slot++) {
    const totalMinutes = slot * 15;
    const hh = `${Math.floor(totalMinutes / 60)}`.padStart(2, "0");
    const mm = `${totalMinutes % 60}`.padStart(2, "0");
    const label = `${hh}:${mm}`;
    points.push({ label, total: slotMap.get(label) ?? null });
  }
  return points;
};
