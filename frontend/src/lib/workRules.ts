// Regras de validação, limites e cálculo de planeamento de obras e orçamentos.
// Usados tanto nos formulários de cliente como na importação Excel e no servidor simulado (422).

import { daysBetween, formatIsoDate, isValidIsoDate, todayIso } from "./format";

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

export interface WorkPeriodBounds {
  plannedStartDate?: string;
  plannedEndDate?: string;
  realStartDate?: string;
  realEndDate?: string;
}

export interface BudgetItemValues {
  categoryName: string;
  contractorName: string;
  budgetedValue: number;
  contractedValue: number;
  executedValue: number;
  invoicedValue: number;
  paidValue: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  realStartDate?: string;
  realEndDate?: string;
}

function dateWithinPeriodError(
  date: string | undefined,
  minDate: string | undefined,
  maxDate: string | undefined,
  periodLabel: string,
): string | undefined {
  if (!date) return undefined;
  if (!isValidIsoDate(date)) return "Data inválida.";
  if (minDate && date < minDate) {
    return `Tem de ser igual ou posterior ao início ${periodLabel} da obra (${formatIsoDate(minDate)}).`;
  }
  if (maxDate && date > maxDate) {
    return `Tem de ser igual ou anterior ao fim ${periodLabel} da obra (${formatIsoDate(maxDate)}).`;
  }
  return undefined;
}

/**
 * Validação de um item de orçamento:
 * Regras:
 * - pago <= faturado <= contratado
 * - executado <= contratado
 * - fim >= início e datas dentro do período da obra (quando definido)
 */
export function budgetItemErrors(
  values: BudgetItemValues,
  workPeriod?: WorkPeriodBounds,
  validCategories?: readonly string[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  const cat = values.categoryName.trim();
  if (!cat) {
    errors.categoryName = "Indique a categoria.";
  } else if (cat.length > WORK_TEXT_LIMITS.categoryName) {
    errors.categoryName = `Máximo de ${WORK_TEXT_LIMITS.categoryName} caracteres.`;
  } else if (validCategories && !validCategories.some((c) => c.toLowerCase() === cat.toLowerCase())) {
    errors.categoryName = "Categoria inválida (consulte a folha Categorias).";
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

  // Regras financeiras
  if (Number.isFinite(values.executedValue) && Number.isFinite(values.contractedValue) && values.executedValue > values.contractedValue) {
    errors.executedValue = "O valor executado não pode exceder o valor contratado.";
  }

  if (Number.isFinite(values.invoicedValue) && Number.isFinite(values.contractedValue) && values.invoicedValue > values.contractedValue) {
    errors.invoicedValue = "O valor faturado não pode exceder o valor contratado.";
  }

  if (Number.isFinite(values.paidValue) && Number.isFinite(values.invoicedValue) && values.paidValue > values.invoicedValue) {
    errors.paidValue = "O valor pago não pode exceder o valor faturado.";
  }

  // Regras de datas
  if (values.plannedStartDate && !isValidIsoDate(values.plannedStartDate)) {
    errors.plannedStartDate = "Data de início previsto inválida.";
  }
  if (values.plannedEndDate && !isValidIsoDate(values.plannedEndDate)) {
    errors.plannedEndDate = "Data de fim previsto inválida.";
  }
  if (!errors.plannedStartDate && !errors.plannedEndDate) {
    const plannedOrderErr = datesError(values.plannedStartDate, values.plannedEndDate);
    if (plannedOrderErr) errors.plannedEndDate = plannedOrderErr;
  }

  if (values.realStartDate && !isValidIsoDate(values.realStartDate)) {
    errors.realStartDate = "Data de início real inválida.";
  }
  if (values.realEndDate && !isValidIsoDate(values.realEndDate)) {
    errors.realEndDate = "Data de fim real inválida.";
  }
  if (!errors.realStartDate && !errors.realEndDate) {
    const realOrderErr = datesError(values.realStartDate, values.realEndDate);
    if (realOrderErr) errors.realEndDate = realOrderErr;
  }

  if (workPeriod) {
    if (!errors.plannedStartDate) {
      const boundErr = dateWithinPeriodError(
        values.plannedStartDate,
        workPeriod.plannedStartDate,
        workPeriod.plannedEndDate,
        "previsto",
      );
      if (boundErr) errors.plannedStartDate = boundErr;
    }
    if (!errors.plannedEndDate) {
      const boundErr = dateWithinPeriodError(
        values.plannedEndDate,
        workPeriod.plannedStartDate,
        workPeriod.plannedEndDate,
        "previsto",
      );
      if (boundErr) errors.plannedEndDate = boundErr;
    }
    if (!errors.realStartDate) {
      const boundErr = dateWithinPeriodError(
        values.realStartDate,
        workPeriod.realStartDate,
        workPeriod.realEndDate,
        "real",
      );
      if (boundErr) errors.realStartDate = boundErr;
    }
    if (!errors.realEndDate) {
      const boundErr = dateWithinPeriodError(
        values.realEndDate,
        workPeriod.realStartDate,
        workPeriod.realEndDate,
        "real",
      );
      if (boundErr) errors.realEndDate = boundErr;
    }
  }

  return errors;
}

/** Calcula o desvio em dias entre a data prevista e a data real (ou hoje). */
export function calcWorkDeviation(
  plannedEndDate?: string,
  realEndDate?: string,
  _isCompleted?: boolean,
): { days: number; label: string; tone: "green" | "red" | "neutral" } {
  if (!plannedEndDate) {
    return { days: 0, label: "—", tone: "neutral" };
  }

  const targetDate = realEndDate ? new Date(realEndDate) : new Date();
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

export interface PlanningProgress {
  hasPlan: boolean;
  totalDays: number;
  elapsedDays: number;
  timePercent: number;
  executedPercent: number;
  isOverdue: boolean;
  overdueDays: number;
  behindSchedule: boolean;
  summary: string;
}

/**
 * Calcula o progresso temporal vs. execução física de uma obra.
 *
 * Exemplos:
 * - Obra em dia (dia 45 de 120, 30% executado):
 *   `planningProgress({ plannedStartDate: "2026-08-01", plannedEndDate: "2026-11-29", executedPercent: 30, state: "Em curso" }, "2026-09-15")`
 *   → `timePercent: 38, executedPercent: 30, summary: "Dia 45 de 120 · 38 % do prazo · 30 % executado"`
 * - Obra atrasada (prazo já passou e não concluída):
 *   `planningProgress({ plannedStartDate: "2026-08-01", plannedEndDate: "2026-11-01", executedPercent: 57, state: "Atrasada" }, "2026-11-11")`
 *   → `isOverdue: true, overdueDays: 10, summary: "Atrasada 10 dias · 57 % executado"`
 * - Sem datas planeadas:
 *   `planningProgress({ executedPercent: 0 }, "2026-11-11")`
 *   → `hasPlan: false, summary: "Sem planeamento definido"`
 */
export function planningProgress(
  work: {
    plannedStartDate?: string;
    plannedEndDate?: string;
    executedPercent: number;
    state?: WorkState;
  },
  today: string = todayIso(),
): PlanningProgress {
  const executedPercent = Math.min(100, Math.max(0, Math.round(work.executedPercent || 0)));

  if (
    !work.plannedStartDate ||
    !work.plannedEndDate ||
    !isValidIsoDate(work.plannedStartDate) ||
    !isValidIsoDate(work.plannedEndDate) ||
    work.plannedEndDate < work.plannedStartDate
  ) {
    return {
      hasPlan: false,
      totalDays: 0,
      elapsedDays: 0,
      timePercent: 0,
      executedPercent,
      isOverdue: false,
      overdueDays: 0,
      behindSchedule: false,
      summary: "Sem planeamento definido",
    };
  }

  const totalDays = Math.max(1, daysBetween(work.plannedStartDate, work.plannedEndDate));
  const rawElapsed = daysBetween(work.plannedStartDate, today);
  const elapsedDays = Math.min(totalDays, Math.max(0, rawElapsed));
  const timePercent = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));

  const isCompleted = work.state === "Concluída";
  const overdueDays = !isCompleted && today > work.plannedEndDate ? daysBetween(work.plannedEndDate, today) : 0;
  const isOverdue = overdueDays > 0;
  const behindSchedule = !isCompleted && (isOverdue || executedPercent < timePercent);

  const summary = isOverdue
    ? `Atrasada ${overdueDays} ${overdueDays === 1 ? "dia" : "dias"} · ${executedPercent} % executado`
    : `Dia ${elapsedDays} de ${totalDays} · ${timePercent} % do prazo · ${executedPercent} % executado`;

  return {
    hasPlan: true,
    totalDays,
    elapsedDays,
    timePercent,
    executedPercent,
    isOverdue,
    overdueDays,
    behindSchedule,
    summary,
  };
}

/**
 * Converte um valor numérico vindo do Excel (número ou texto com vírgula ou ponto decimal).
 * Células vazias devolvem 0; texto não numérico devolve NaN (para ser apanhado por `budgetItemErrors`).
 */
export function parseExcelDecimal(raw: unknown): number {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : NaN;
  const cleaned = String(raw)
    .replace(/€/g, "")
    .replace(/[\s\u00A0]/g, "")
    .trim();
  if (!cleaned) return 0;

  let normalized = cleaned;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(cleaned)) {
    normalized = cleaned.replace(/,/g, "");
  } else if (cleaned.includes(",") && !cleaned.includes(".")) {
    normalized = cleaned.replace(",", ".");
  }

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return NaN;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : NaN;
}

/** Formata os erros de uma linha importada com o prefixo "Linha N: ...". */
export function formatBudgetImportRowErrors(rowNumber: number, errors: Record<string, string>): string[] {
  return Object.values(errors).map((message) => {
    const lower = message.charAt(0).toLowerCase() + message.slice(1);
    return `Linha ${rowNumber}: ${lower.replace(/\.$/, "")}`;
  });
}
