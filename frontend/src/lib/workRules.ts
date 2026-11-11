// Regras de validação e limites de obras e orçamentos.
// Usados tanto nos formulários de cliente como no servidor simulado (422).

export const WORK_TEXT_LIMITS = {
  name: 80,
  notes: 500,
  categoryName: 80,
  contractorName: 80,
} as const;

export const MIN_WORK_NAME_LENGTH = 3;

export const WORK_STATES = ["Planeada", "Em curso", "Concluída", "Atrasada"] as const;
export type WorkState = (typeof WORK_STATES)[number];

export const PHOTO_STAGES = ["Antes", "Durante", "Depois"] as const;
export type PhotoStage = (typeof PHOTO_STAGES)[number];

export const WORK_DOCUMENT_TYPES = [
  "Orçamento de obra",
  "Planta",
  "Licença",
  "Fotografia de obra",
  "Fatura",
  "Outro",
] as const;

export const BUDGET_CATEGORIES = [
  "Demolições e Estrutura",
  "Alvenarias e Divisórias",
  "Eletricidade e ITED",
  "Canalização e Climatização",
  "Carpintarias e Caixilharias",
  "Pinturas e Acabamentos",
  "Revestimentos e Pavimentos",
  "Serralharias",
  "Louças e Torneiras",
  "Outro",
];

export interface NumberRule {
  min: number;
  max: number;
  decimals: number;
}

export const MONEY: NumberRule = { min: 0, max: 99_999_999, decimals: 2 };

export function fitsRule(value: number, rule: NumberRule = MONEY): boolean {
  if (!Number.isFinite(value) || value < rule.min || value > rule.max) return false;
  const factor = 10 ** rule.decimals;
  return Math.abs(Math.round(value * factor) - value * factor) < 1e-6;
}

/** Valida o nome de uma obra. */
export function workNameError(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return "Indique o nome da obra.";
  if (trimmed.length < MIN_WORK_NAME_LENGTH) {
    return `Escreva pelo menos ${MIN_WORK_NAME_LENGTH} caracteres.`;
  }
  if (trimmed.length > WORK_TEXT_LIMITS.name) {
    return `Máximo de ${WORK_TEXT_LIMITS.name} caracteres.`;
  }
  return undefined;
}

/** Valida a coerência entre data de início e fim. */
export function datesError(startDate?: string, endDate?: string): string | undefined {
  if (!startDate || !endDate) return undefined;
  if (endDate < startDate) {
    return "A data de fim tem de ser posterior ou igual à data de início.";
  }
  return undefined;
}

export interface WorkFormValues {
  name: string;
  operationId?: number | string;
  state?: WorkState;
  plannedStartDate?: string;
  plannedEndDate?: string;
  realStartDate?: string;
  realEndDate?: string;
  notes?: string;
}

/** Valida o formulário de obra. */
export function workFormErrors(values: WorkFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  const nameErr = workNameError(values.name);
  if (nameErr) errors.name = nameErr;

  if (!values.operationId) {
    errors.operationId = "Selecione uma operação.";
  }

  const plannedDatesErr = datesError(values.plannedStartDate, values.plannedEndDate);
  if (plannedDatesErr) {
    errors.plannedEndDate = plannedDatesErr;
  }

  const realDatesErr = datesError(values.realStartDate, values.realEndDate);
  if (realDatesErr) {
    errors.realEndDate = realDatesErr;
  }

  if (values.notes && values.notes.length > WORK_TEXT_LIMITS.notes) {
    errors.notes = `Máximo de ${WORK_TEXT_LIMITS.notes} caracteres.`;
  }

  return errors;
}

export interface BudgetItemValues {
  categoryName: string;
  contractorName: string;
  budgetedValue: number;
  contractedValue: number;
  executedValue: number;
  invoicedValue: number;
  paidValue: number;
}

/**
 * Validação de um item de orçamento:
 * Regras:
 * - pago <= faturado <= contratado
 * - executado <= contratado
 */
export function budgetItemErrors(values: BudgetItemValues): Record<string, string> {
  const errors: Record<string, string> = {};

  const cat = values.categoryName.trim();
  if (!cat) {
    errors.categoryName = "Indique a categoria.";
  } else if (cat.length > WORK_TEXT_LIMITS.categoryName) {
    errors.categoryName = `Máximo de ${WORK_TEXT_LIMITS.categoryName} caracteres.`;
  }

  const contractor = values.contractorName.trim();
  if (!contractor) {
    errors.contractorName = "Indique o empreiteiro.";
  } else if (contractor.length > WORK_TEXT_LIMITS.contractorName) {
    errors.contractorName = `Máximo de ${WORK_TEXT_LIMITS.contractorName} caracteres.`;
  }

  if (!fitsRule(values.budgetedValue) || values.budgetedValue < 0) {
    errors.budgetedValue = "Valor previsto inválido.";
  }
  if (!fitsRule(values.contractedValue) || values.contractedValue < 0) {
    errors.contractedValue = "Valor contratado inválido.";
  }
  if (!fitsRule(values.executedValue) || values.executedValue < 0) {
    errors.executedValue = "Valor executado inválido.";
  }
  if (!fitsRule(values.invoicedValue) || values.invoicedValue < 0) {
    errors.invoicedValue = "Valor faturado inválido.";
  }
  if (!fitsRule(values.paidValue) || values.paidValue < 0) {
    errors.paidValue = "Valor pago inválido.";
  }

  // Regras de negócio
  if (values.executedValue > values.contractedValue) {
    errors.executedValue = "O valor executado não pode exceder o valor contratado.";
  }

  if (values.invoicedValue > values.contractedValue) {
    errors.invoicedValue = "O valor faturado não pode exceder o valor contratado.";
  }

  if (values.paidValue > values.invoicedValue) {
    errors.paidValue = "O valor pago não pode exceder o valor faturado.";
  }

  return errors;
}

/** Calcula o desvio em dias entre a data prevista e a data real (ou hoje). */
export function calcWorkDeviation(
  plannedEndDate?: string,
  realEndDate?: string,
  isCompleted?: boolean,
): { days: number; label: string; tone: "green" | "red" | "neutral" } {
  if (!plannedEndDate) {
    return { days: 0, label: "—", tone: "neutral" };
  }

  const targetDate = realEndDate
    ? new Date(realEndDate)
    : isCompleted
      ? new Date()
      : new Date();

  const planned = new Date(plannedEndDate);
  const diffMs = targetDate.getTime() - planned.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return { days, label: `+${days} dias`, tone: "red" };
  }
  if (days < 0) {
    return { days, label: `${days} dias`, tone: "green" };
  }
  return { days: 0, label: "Sem desvio", tone: "neutral" };
}
