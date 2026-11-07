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

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Date → "05/11/2026" */
export function formatDate(date: Date): string {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
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
