import type { InvestmentInput, InvestorProfile } from "../api/investorsApi";
import { optionalTextError } from "./leadRules";
import { MONEY, PERCENT, fitsRule } from "./opportunityRules";
import { CAEP_TERMS, INVESTOR_KINDS } from "./taxRules";

// Limites do perfil de investidor e dos investimentos. Usados pelos formulários
// e pelo servidor simulado (recusa o que chegar fora disto).

export const INVESTOR_TEXT_LIMITS = {
  preferredTerms: 200,
  notes: 1000,
} as const;

/** Prazo previsto de um investimento, em meses, só para simular o retorno líquido. */
export const TERM_MONTHS = { min: 1, max: 120, decimals: 0 } as const;

/** Datas de acordo aceites: de 2000 até 10 anos à frente (um ano 0001 ou 275760 é um erro de escrita). */
export const AGREEMENT_DATE_RANGE = {
  min: "2000-01-01",
  max: `${new Date().getFullYear() + 10}-12-31`,
} as const;

/** Estados da relação, pela ordem do cliente. Substituem os antigos. */
export const RELATION_STATUSES = ["Por contactar", "Inativo", "Qualificado", "Ativo"] as const;

/**
 * Estado da relação vindo do servidor: os antigos "prospeto" passam a "Por contactar" (a migração dos valores
 * guardados é do backend; isto só garante que um valor antigo não aparece solto).
 */
export function normalizeRelationStatus(status: string): string {
  return /^prospe(c)?to$/i.test(status.trim()) ? "Por contactar" : status;
}

/** Perfil de um investidor novo: tudo por preencher. */
export const emptyInvestorProfile: InvestorProfile = {
  investorKind: "",
  caepTerm: "Menos de 1 ano",
  availableCapital: 0,
  riskProfile: "",
  preferredZones: [],
  minAmount: 0,
  maxAmount: 0,
  preferredTerms: "",
  relationStatus: "",
  notes: "",
};

export type InvestorProfileErrors = Partial<Record<keyof InvestorProfile, string>>;
export type InvestmentErrors = Partial<Record<keyof InvestmentInput, string>>;

const positiveMoney = (value: number) => value > 0 && fitsRule(value, MONEY);

function withoutEmpty<T extends object>(errors: T): T {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as T;
}

/** Erros do perfil, por campo. */
export function investorProfileErrors(profile: InvestorProfile): InvestorProfileErrors {
  return withoutEmpty<InvestorProfileErrors>({
    investorKind: profile.investorKind && INVESTOR_KINDS.includes(profile.investorKind) ? undefined : "Escolha se é particular ou empresa.",
    caepTerm: CAEP_TERMS.includes(profile.caepTerm) ? undefined : "Escolha o prazo do CAEP.",
    availableCapital: positiveMoney(profile.availableCapital) ? undefined : "Indique o capital disponível.",
    minAmount: !positiveMoney(profile.minAmount) ? "Indique o montante mínimo." : undefined,
    maxAmount: !positiveMoney(profile.maxAmount)
      ? "Indique o montante máximo."
      : profile.minAmount > profile.maxAmount
        ? "O máximo não pode ser inferior ao mínimo."
        : profile.availableCapital > 0 && profile.maxAmount > profile.availableCapital
          ? "O máximo não pode passar o capital disponível."
          : undefined,
    riskProfile: profile.riskProfile ? undefined : "Escolha o perfil de risco.",
    relationStatus: (RELATION_STATUSES as readonly string[]).includes(profile.relationStatus) ? undefined : "Escolha o estado da relação.",
    preferredTerms: optionalTextError(profile.preferredTerms, INVESTOR_TEXT_LIMITS.preferredTerms),
    notes: optionalTextError(profile.notes, INVESTOR_TEXT_LIMITS.notes),
  });
}

/** "Particular" ou "Empresa · CAEP mais de 1 ano". */
export function investorKindLabel({ investorKind, caepTerm }: Pick<InvestorProfile, "investorKind" | "caepTerm">): string {
  if (!investorKind) return "—";
  return investorKind === "Empresa" ? `Empresa · CAEP ${caepTerm.toLowerCase()}` : investorKind;
}

/**
 * Lucro do investidor num investimento, antes do imposto. Juro fixo: valor comprometido × taxa.
 * Participação nos lucros: margem prevista da operação × taxa (a parte do lucro que lhe cabe).
 */
export function investmentGrossProfit(investment: Pick<InvestmentInput, "committedValue" | "returnType" | "returnRate">, operationMargin: number): number {
  const base = investment.returnType === "Participação nos lucros" ? operationMargin : investment.committedValue;
  return (base * investment.returnRate) / 100;
}

/** Erros de um investimento novo, por campo. */
export function investmentErrors(investment: InvestmentInput): InvestmentErrors {
  const date = investment.agreementDate;
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date));
  return withoutEmpty<InvestmentErrors>({
    operationCode: investment.operationCode ? undefined : "Escolha a operação.",
    committedValue: positiveMoney(investment.committedValue) ? undefined : "Indique o valor comprometido.",
    participationPercent:
      investment.participationPercent > 0 && fitsRule(investment.participationPercent, PERCENT) ? undefined : "Indique a participação (até 100%).",
    returnType: investment.returnType ? undefined : "Escolha o tipo de retorno.",
    returnRate: fitsRule(investment.returnRate, PERCENT) ? undefined : "Taxa entre 0 e 100%.",
    agreementDate: !validDate
      ? "Indique a data do acordo."
      : date < AGREEMENT_DATE_RANGE.min || date > AGREEMENT_DATE_RANGE.max
        ? `A data tem de estar entre ${AGREEMENT_DATE_RANGE.min.slice(0, 4)} e ${AGREEMENT_DATE_RANGE.max.slice(0, 4)}.`
        : undefined,
  });
}
