import type { InvestmentInput, InvestorProfile } from "../api/investorsApi";
import { optionalTextError } from "./leadRules";
import { MONEY, PERCENT, fitsRule } from "./opportunityRules";

// Limites do perfil de investidor e dos investimentos. Usados pelos formulários
// e pelo servidor simulado (recusa o que chegar fora disto).

export const INVESTOR_TEXT_LIMITS = {
  preferredTerms: 200,
} as const;

/** Datas de acordo aceites: de 2000 até 10 anos à frente (um ano 0001 ou 275760 é um erro de escrita). */
export const AGREEMENT_DATE_RANGE = {
  min: "2000-01-01",
  max: `${new Date().getFullYear() + 10}-12-31`,
} as const;

/** Perfil de um investidor novo: tudo por preencher. */
export const emptyInvestorProfile: InvestorProfile = {
  availableCapital: 0,
  riskProfile: "",
  preferredZones: [],
  minAmount: 0,
  maxAmount: 0,
  preferredTerms: "",
  relationStatus: "",
};

export type InvestorProfileErrors = Partial<Record<keyof InvestorProfile, string>>;
export type InvestmentErrors = Partial<Record<keyof InvestmentInput, string>>;

const positiveMoney = (value: number) => value > 0 && fitsRule(value, MONEY);

function withoutEmpty<T extends object>(errors: T): T {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as T;
}

/** Erros do perfil, por campo. Regra principal: mínimo ≤ máximo ≤ capital disponível. */
export function investorProfileErrors(profile: InvestorProfile): InvestorProfileErrors {
  const { availableCapital: capital, minAmount: min, maxAmount: max } = profile;
  const errors: InvestorProfileErrors = {
    availableCapital: positiveMoney(capital) ? undefined : "Indique o capital disponível.",
    minAmount: positiveMoney(min) ? undefined : "Indique o montante mínimo.",
    maxAmount: positiveMoney(max) ? undefined : "Indique o montante máximo.",
    riskProfile: profile.riskProfile ? undefined : "Escolha o perfil de risco.",
    relationStatus: profile.relationStatus ? undefined : "Escolha o estado da relação.",
    preferredTerms: optionalTextError(profile.preferredTerms, INVESTOR_TEXT_LIMITS.preferredTerms),
  };
  if (!errors.minAmount && !errors.maxAmount && min > max) errors.maxAmount = "O máximo tem de ser igual ou maior que o mínimo.";
  if (!errors.availableCapital) {
    if (!errors.minAmount && min > capital) errors.minAmount = "O mínimo não pode passar o capital disponível.";
    if (!errors.maxAmount && max > capital) errors.maxAmount = "O máximo não pode passar o capital disponível.";
  }
  return withoutEmpty(errors);
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
