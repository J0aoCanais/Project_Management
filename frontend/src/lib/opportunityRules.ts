import type { ExtraCost, FinanceValues } from "../api/opportunitiesApi";

// Limites dos campos das oportunidades. Usados pelos formulários (não deixam escrever além disto)
// e pelo servidor simulado (recusa o que chegar fora disto).

/** Limites de um campo numérico. */
export interface NumberRule {
  min: number;
  max: number;
  /** Casas decimais permitidas; 0 = só inteiros. */
  decimals: number;
}

/** Valores em euros: até 99 999 999 €, com cêntimos. */
export const MONEY: NumberRule = { min: 0, max: 99_999_999, decimals: 2 };
/** Percentagens: 0 a 100%, duas casas decimais. */
export const PERCENT: NumberRule = { min: 0, max: 100, decimals: 2 };
/** Prazo em meses inteiros, até 10 anos. */
export const MONTHS: NumberRule = { min: 0, max: 120, decimals: 0 };

/** Tamanho máximo dos textos. */
export const TEXT_LIMITS = {
  title: 60,
  extraCostLabel: 80,
  rejectionReason: 500,
} as const;

export const MIN_TITLE_LENGTH = 3;

export const FINANCE_RULES: Record<keyof FinanceValues, NumberRule> = {
  purchasePrice: MONEY,
  imt: MONEY,
  stampDuty: MONEY,
  deedCosts: MONEY,
  workCost: MONEY,
  expectedSalePrice: MONEY,
  commissionPercent: PERCENT,
  commissionVatPercent: PERCENT,
  termMonths: MONTHS,
};

/** Dentro dos limites e com as casas decimais permitidas. */
export function fitsRule(value: number, rule: NumberRule): boolean {
  if (!Number.isFinite(value) || value < rule.min || value > rule.max) return false;
  const factor = 10 ** rule.decimals;
  return Math.abs(Math.round(value * factor) - value * factor) < 1e-6;
}

/** Erro do título de uma oportunidade, ou `undefined` se estiver bem. */
export function titleError(title: string): string | undefined {
  const text = title.trim();
  if (!text) return "Indique o imóvel ou a morada.";
  if (text.length < MIN_TITLE_LENGTH) return `Escreva pelo menos ${MIN_TITLE_LENGTH} caracteres.`;
  if (text.length > TEXT_LIMITS.title) return `Máximo de ${TEXT_LIMITS.title} caracteres.`;
  return undefined;
}

/** Erros da análise financeira, por campo. Vazio quando se pode guardar. */
export function financeErrors(values: FinanceValues): Partial<Record<keyof FinanceValues, string>> {
  const errors: Partial<Record<keyof FinanceValues, string>> = {};
  for (const key of Object.keys(FINANCE_RULES) as (keyof FinanceValues)[]) {
    const rule = FINANCE_RULES[key];
    if (!fitsRule(values[key], rule)) errors[key] = `Valor entre ${rule.min} e ${rule.max.toLocaleString("pt-PT")}.`;
  }
  if (!errors.purchasePrice && values.purchasePrice <= 0) errors.purchasePrice = "Indique o preço de compra.";
  if (!errors.expectedSalePrice && values.expectedSalePrice <= 0) errors.expectedSalePrice = "Indique o preço de venda previsto.";
  if (!errors.termMonths && values.termMonths < 1) errors.termMonths = "Indique o prazo (pelo menos 1 mês).";
  return errors;
}

/** Erros de cada linha de "Outros custos", pelo id da linha. */
export function extraCostErrors(extras: ExtraCost[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const extra of extras) {
    const label = extra.label.trim();
    if (!label) errors[extra.id] = "Indique a descrição do custo.";
    else if (label.length > TEXT_LIMITS.extraCostLabel) errors[extra.id] = `Descrição com máximo de ${TEXT_LIMITS.extraCostLabel} caracteres.`;
    else if (!fitsRule(extra.value, MONEY) || extra.value <= 0) errors[extra.id] = "Indique um valor maior que 0 €.";
  }
  return errors;
}
