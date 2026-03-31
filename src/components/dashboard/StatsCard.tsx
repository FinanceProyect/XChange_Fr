interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export default function StatsCard({ title, value }: StatsCardProps) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white/95 px-3 py-4 shadow-[0_6px_14px_rgba(15,23,42,0.04)] backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(15,23,42,0.08)]">
      <div
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/80 to-transparent"
        aria-hidden="true"
      />
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
          {title}
        </p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
