// Nomes e limites das fases, num único sítio. Alinhado com `Phase` em app/models.py.

export interface Phase {
  name: string;
  /** Dias numa fase a partir dos quais o registo é assinalado. Sem valor, usa-se o limite por omissão. */
  maxDaysStalled?: number;
}

export const DEFAULT_MAX_DAYS_STALLED = 10;

export const OPPORTUNITY_PHASES: Phase[] = [
  { name: "Novo" },
  { name: "Contactado" },
  { name: "Análise financeira" },
  { name: "Informação pendente" },
  { name: "Due diligence" },
  { name: "Negociação" },
  { name: "CPCV" },
  { name: "Aprovado" },
];

/** Numeradas a partir de 9, a seguir às oportunidades. */
export const OPERATION_PHASES: Phase[] = [
  { name: "Em aquisição" },
  { name: "Adquirido" },
  { name: "Em obra" },
  { name: "Em preparação para venda" },
  { name: "À venda" },
  { name: "Vendido" },
  { name: "Fechado" },
];

export const LAST_OPPORTUNITY_PHASE = OPPORTUNITY_PHASES.length - 1;

export function isStalled(phase: Phase, daysInPhase: number): boolean {
  return daysInPhase > (phase.maxDaysStalled ?? DEFAULT_MAX_DAYS_STALLED);
}
