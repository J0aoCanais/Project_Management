// Formatação em pt-PT. Usar sempre estas funções em vez de formatar à mão.

const currency = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** 128000 → "128 000 €" */
export function formatMoney(value: number): string {
  return currency.format(value);
}

/** 22.8 → "22,8%" */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace(".", ",")}%`;
}

/** Texto escrito num campo → número: "5,5" e "5.5" → 5.5; "220.000" → 220000; inválido → 0. */
export function parseDecimal(text: string): number {
  const trimmed = text.trim();
  const withoutThousands = /^\d{1,3}(\.\d{3})+(,\d*)?$/.test(trimmed) ? trimmed.replace(/\./g, "") : trimmed;
  const value = Number(withoutThousands.replace(",", "."));
  return Number.isFinite(value) ? value : 0;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Date → "05/11/2026" */
export function formatDate(date: Date): string {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** Lê uma data ISO; "2026-11-18" é um dia local, não meia-noite UTC (que noutro fuso seria o dia anterior). */
function parseIsoDate(iso: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return dateOnly ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])) : new Date(iso);
}

/** "2026-11-05" → "05/11/2026" */
export function formatIsoDate(iso: string): string {
  return formatDate(parseIsoDate(iso));
}

export function isToday(iso: string): boolean {
  return parseIsoDate(iso).toDateString() === new Date().toDateString();
}

/** Hoje → "Hoje, 09:42"; outros dias → "05/11/2026" */
export function formatActivityDate(iso: string): string {
  if (!isToday(iso)) return formatIsoDate(iso);
  const date = parseIsoDate(iso);
  return `Hoje, ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** 340000 → "332 KB"; 1258291 → "1,2 MB" */
export function formatFileSize(bytes: number): string {
  const kilobytes = Math.max(1, Math.round(bytes / 1024));
  if (kilobytes < 1024) return `${kilobytes} KB`;
  return `${(bytes / 1048576).toFixed(1).replace(".", ",")} MB`;
}

const longDate = new Intl.DateTimeFormat("pt-PT", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Date → "Quarta-feira, 5 de novembro" */
export function formatLongDate(date: Date): string {
  const text = longDate.format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}
