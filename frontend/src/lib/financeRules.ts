import type { FinancingInput, Movement, MovementInput, MovementLinkKind, MovementOptions, MovementStatus } from "../api/financeApi";
import { formatMoney, isValidIsoDate } from "./format";
import { MONEY, fitsRule } from "./opportunityRules";

// Regras dos movimentos financeiros e financiamentos. Usadas pelos formulários e pelo servidor simulado.

export const FINANCE_TEXT_LIMITS = {
  notes: 500,
  financingName: 80,
} as const;

export const MIN_FINANCING_NAME_LENGTH = 2;

/** Valor do filtro de operação para os movimentos sem operação. */
export const NO_OPERATION = "Sem operação";

export const MOVEMENT_STATUSES: MovementStatus[] = ["Previsto", "Realizado", "Atrasado"];

export const LINK_KIND_LABELS: Record<MovementLinkKind, string> = {
  operation: "Operação",
  investment: "Investimento",
  budgetItem: "Item de orçamento",
  financing: "Financiamento",
};

const LINK_KIND_REQUIRED: Record<MovementLinkKind, string> = {
  operation: "Escolha a operação.",
  investment: "Escolha o investimento.",
  budgetItem: "Escolha o item de orçamento.",
  financing: "Escolha o financiamento.",
};

/** Realizado se tem data efetiva; atrasado se a data prevista já passou; senão previsto. */
export function movementStatus(expectedDate: string | undefined, effectiveDate: string | undefined, today: string): MovementStatus {
  if (effectiveDate) return "Realizado";
  if (expectedDate && expectedDate < today) return "Atrasado";
  return "Previsto";
}

/** Data a mostrar: a efetiva, se existir, senão a prevista. */
export function movementDate(movement: Pick<Movement, "expectedDate" | "effectiveDate">): string | undefined {
  return movement.effectiveDate ?? movement.expectedDate;
}

/** Erro da data efetiva: obrigatória ao marcar como realizado e nunca no futuro. */
export function effectiveDateError(date: string | undefined, today: string, required = false): string | undefined {
  if (!date) return required ? "Indique a data em que foi realizado." : undefined;
  if (!isValidIsoDate(date)) return "Data inválida.";
  if (date > today) return "A data efetiva não pode ser no futuro.";
  return undefined;
}

/** Valor ainda por pagar de um item de orçamento. Ao editar, o próprio movimento não conta como já usado. */
export function budgetRoom(item: { contracted: number; used: number }, ownAmount = 0): number {
  return item.contracted - item.used + ownAmount;
}

/** Erro de uma saída que excede o valor contratado em falta. */
export function budgetRoomError(amount: number, room: number): string | undefined {
  if (amount <= room) return undefined;
  return room > 0
    ? `Excede o valor contratado em falta neste item (${formatMoney(room)}).`
    : "Este item de orçamento já está totalmente pago.";
}

export type MovementErrors = Partial<Record<"categoryId" | "amount" | "expectedDate" | "effectiveDate" | "link" | "notes", string>>;

interface MovementContext {
  today: string;
  options: MovementOptions;
  /** O movimento a ser editado, tal como está guardado. */
  original?: Pick<Movement, "amount" | "direction" | "link">;
}

/** Erros de um movimento, por campo. Vazio quando se pode guardar. */
export function movementErrors(input: MovementInput, { today, options, original }: MovementContext): MovementErrors {
  const errors: MovementErrors = {};
  const category = options.categories.find((item) => item.id === input.categoryId);
  if (!category) errors.categoryId = "Escolha a categoria.";
  if (!fitsRule(input.amount, MONEY) || input.amount <= 0) errors.amount = "Indique um valor maior que 0 €.";

  if (!input.expectedDate && !input.effectiveDate) errors.expectedDate = "Indique a data prevista ou a data efetiva.";
  else if (input.expectedDate && !isValidIsoDate(input.expectedDate)) errors.expectedDate = "Data inválida.";
  const effective = effectiveDateError(input.effectiveDate, today);
  if (effective) errors.effectiveDate = effective;

  if (input.link) {
    const { kind, id } = input.link;
    const exists = {
      operation: options.operations,
      investment: options.investments,
      budgetItem: options.budgetItems,
      financing: options.financings,
    }[kind].some((item) => item.id === id);
    if (!exists) errors.link = LINK_KIND_REQUIRED[kind];
    const item = options.budgetItems.find((budgetItem) => budgetItem.id === id);
    if (kind === "budgetItem" && item && category?.direction === "Saída" && !errors.amount) {
      const own = original?.direction === "Saída" && original.link?.kind === "budgetItem" && original.link.id === id ? original.amount : 0;
      const room = budgetRoomError(input.amount, budgetRoom(item, own));
      if (room) errors.amount = room;
    }
  }

  if ((input.notes ?? "").length > FINANCE_TEXT_LIMITS.notes) errors.notes = `Máximo de ${FINANCE_TEXT_LIMITS.notes} caracteres.`;
  return errors;
}

export function financingErrors(input: FinancingInput): Partial<Record<keyof FinancingInput, string>> {
  const errors: Partial<Record<keyof FinancingInput, string>> = {};
  const name = input.name.trim();
  if (name.length < MIN_FINANCING_NAME_LENGTH) errors.name = `Escreva pelo menos ${MIN_FINANCING_NAME_LENGTH} caracteres.`;
  else if (name.length > FINANCE_TEXT_LIMITS.financingName) errors.name = `Máximo de ${FINANCE_TEXT_LIMITS.financingName} caracteres.`;
  if (!fitsRule(input.amount, MONEY) || input.amount <= 0) errors.amount = "Indique um montante maior que 0 €.";
  return errors;
}

export interface MovementTotals {
  /** Entradas realizadas. */
  inflow: number;
  /** Saídas realizadas. */
  outflow: number;
  balance: number;
  /** Entradas menos saídas ainda por realizar (previstas e atrasadas). */
  pending: number;
  pendingCount: number;
}

export function movementTotals(movements: Pick<Movement, "amount" | "direction" | "status">[]): MovementTotals {
  const totals: MovementTotals = { inflow: 0, outflow: 0, balance: 0, pending: 0, pendingCount: 0 };
  for (const movement of movements) {
    const signed = movement.direction === "Entrada" ? movement.amount : -movement.amount;
    if (movement.status === "Realizado") {
      if (movement.direction === "Entrada") totals.inflow += movement.amount;
      else totals.outflow += movement.amount;
    } else {
      totals.pending += signed;
      totals.pendingCount += 1;
    }
  }
  totals.balance = totals.inflow - totals.outflow;
  return totals;
}
