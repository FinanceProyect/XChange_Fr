// Convierte "YYYY-MM-DD" a "YYYY-MM-DDTHH:mm:ss±HH:MM" con el offset local del usuario
export const toLocalISODateTime = (dateStr: string): string => {
  const pad = (v: number) => v.toString().padStart(2, '0')
  const offsetMinutes = new Date().getTimezoneOffset()
  const sign = offsetMinutes > 0 ? '-' : '+'
  const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60))
  const offsetRemainder = pad(Math.abs(offsetMinutes) % 60)
  return `${dateStr}T00:00:00${sign}${offsetHours}:${offsetRemainder}`
}

export const parseDateValue = (value?: string) => {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const formatDateValue = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatTimeValue = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
