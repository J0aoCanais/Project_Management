import type { Movement, MovementDirection } from "../api/financeApi";

// Agregações para "Previsto vs. realizado". Funções puras sobre a lista de movimentos.

export interface MonthTotals {
  /** "2026-11" */
  month: string;
  expected: number;
  done: number;
}

/** Por mês: o previsto pela data prevista e o realizado pela data efetiva. */
export function totalsByMonth(movements: Movement[], direction: MovementDirection): MonthTotals[] {
  const months = new Map<string, MonthTotals>();
  const add = (date: string | undefined, key: "expected" | "done", amount: number) => {
    if (!date) return;
    const month = date.slice(0, 7);
    const entry = months.get(month) ?? { month, expected: 0, done: 0 };
    entry[key] += amount;
    months.set(month, entry);
  };
  for (const movement of movements) {
    if (movement.direction !== direction) continue;
    // Um movimento sem data prevista conta como previsto na data em que foi realizado.
    add(movement.expectedDate ?? movement.effectiveDate, "expected", movement.amount);
    add(movement.effectiveDate, "done", movement.amount);
  }
  return [...months.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export interface CategoryTotals {
  category: string;
  expected: number;
  done: number;
}

/** Por categoria: o total de todos os movimentos (previsto) e o já realizado. Maior primeiro. */
export function totalsByCategory(movements: Movement[], direction: MovementDirection): CategoryTotals[] {
  const categories = new Map<string, CategoryTotals>();
  for (const movement of movements) {
    if (movement.direction !== direction) continue;
    const entry = categories.get(movement.category) ?? { category: movement.category, expected: 0, done: 0 };
    entry.expected += movement.amount;
    if (movement.status === "Realizado") entry.done += movement.amount;
    categories.set(movement.category, entry);
  }
  return [...categories.values()].sort((a, b) => b.expected - a.expected);
}
