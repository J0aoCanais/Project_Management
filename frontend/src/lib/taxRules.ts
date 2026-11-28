// Imposto sobre o lucro de uma operação, conforme a estrutura do investidor.
// Só as 3 taxas da folha de cálculo do cliente (sem derramas, tributação autónoma nem englobamento).
// Ordem das contas (pedida pelo cliente): faturação − custos → IRC da operação → divisão pela percentagem do
// investidor ativo (`profitSplit`) → impostos da estrutura do investidor só sobre a parte dele (`netReturn`).
// Partilhado pelos investidores, oportunidades, finanças (tarefa 08) e operações (tarefa 10).
// Não importa nada de propósito: os testes (`npm test`) correm este ficheiro diretamente no Node.

export type InvestorKind = "Particular" | "Empresa";
export type CaepTerm = "Mais de 1 ano" | "Menos de 1 ano";

export const INVESTOR_KINDS: InvestorKind[] = ["Particular", "Empresa"];
export const CAEP_TERMS: CaepTerm[] = ["Mais de 1 ano", "Menos de 1 ano"];

/** IRC de uma empresa com CAEP inferior a 1 ano, em percentagem. */
export const IRC_RATE = 19;
/** IRC de uma empresa com CAEP superior a 1 ano, em percentagem. */
export const IRC_RATE_LONG_CAEP = 0;
/** IRS de um particular, em percentagem. */
export const IRS_RATE = 28;

/**
 * Valores de `Opportunity.passive_investor_profile` no backend: a estrutura do investidor numa só string.
 * São os únicos 3 aceites (a validação no schema do backend ainda está por fazer).
 */
export const PASSIVE_INVESTOR_PROFILES = ["Particular", "Empresa - CAEP inferior a um ano", "Empresa - CAEP superior a um ano"] as const;
export type PassiveInvestorProfile = (typeof PASSIVE_INVESTOR_PROFILES)[number];

export interface InvestorStructure {
  kind: InvestorKind;
  caep: CaepTerm;
}

/** Estrutura → valor do backend. Um particular não tem CAEP. */
export function toPassiveProfile({ kind, caep }: InvestorStructure): PassiveInvestorProfile {
  if (kind === "Particular") return "Particular";
  return caep === "Mais de 1 ano" ? "Empresa - CAEP superior a um ano" : "Empresa - CAEP inferior a um ano";
}

/** Valor do backend → estrutura. Um valor desconhecido (ou vazio) é tratado como particular. */
export function fromPassiveProfile(value: string | null | undefined): InvestorStructure {
  if (value === "Empresa - CAEP superior a um ano") return { kind: "Empresa", caep: "Mais de 1 ano" };
  if (value === "Empresa - CAEP inferior a um ano") return { kind: "Empresa", caep: "Menos de 1 ano" };
  return { kind: "Particular", caep: "Menos de 1 ano" };
}

/** Taxa de imposto em percentagem: 19 significa 19%. */
export function taxRate(kind: InvestorKind, caep: CaepTerm): number {
  // TODO: confirmar com o cliente a taxa de um particular com CAEP superior a 1 ano (não está na folha). Por defeito, IRS.
  if (kind === "Particular") return IRS_RATE;
  return caep === "Mais de 1 ano" ? IRC_RATE_LONG_CAEP : IRC_RATE;
}

const toCents = (euros: number) => Math.round(euros * 100);

export interface ProfitSplitInput {
  /** O que se fatura: a venda prevista, em euros. */
  revenue: number;
  /** Todos os custos da operação (compra, IMT, IS, escritura, obra, outros custos e comissão), em euros. */
  costs: number;
  /** Parte do lucro do investidor ativo, em percentagem (0–100). */
  investorSharePercent: number;
}

export interface ProfitSplit {
  profitBeforeTax: number;
  /** IRC da operação: `IRC_RATE` do lucro. Um prejuízo não paga IRC. */
  irc: number;
  profitAfterIrc: number;
  /** Parte do investidor, já depois do IRC da operação e antes dos impostos da estrutura dele. */
  investorProfit: number;
  companyProfit: number;
}

/**
 * Passos 1 a 3 da tarefa 09: faturação menos custos, menos IRC, e divisão pela percentagem do investidor ativo.
 * Contas em cêntimos; o IRC e a parte do investidor são arredondados ao cêntimo e a empresa fica com o resto,
 * para as duas partes somarem sempre o lucro depois de IRC. Um prejuízo não se divide: fica todo na empresa.
 */
export function profitSplit({ revenue, costs, investorSharePercent }: ProfitSplitInput): ProfitSplit {
  const profitCents = toCents(revenue) - toCents(costs);
  const ircCents = profitCents > 0 ? Math.round((profitCents * IRC_RATE) / 100) : 0;
  const afterCents = profitCents - ircCents;
  const share = Math.min(100, Math.max(0, investorSharePercent || 0));
  const investorCents = afterCents > 0 ? Math.round((afterCents * share) / 100) : 0;
  return {
    profitBeforeTax: profitCents / 100,
    irc: ircCents / 100,
    profitAfterIrc: afterCents / 100,
    investorProfit: investorCents / 100,
    companyProfit: (afterCents - investorCents) / 100,
  };
}

export interface NetReturnInput {
  /** Lucro do investidor antes dos impostos da estrutura dele (`profitSplit().investorProfit`), em euros. */
  grossProfit: number;
  /** Capital investido, em euros (base do cash-on-cash). */
  investedCapital: number;
  termMonths: number;
  kind: InvestorKind;
  caep: CaepTerm;
}

export interface NetReturn {
  /** Em percentagem. */
  taxRate: number;
  tax: number;
  netProfit: number;
  /** Lucro líquido sobre o capital investido, em percentagem. */
  cashOnCash: number;
  /** Cash-on-cash × 12 / prazo em meses (juro simples), em percentagem. */
  annualized: number;
}

/**
 * Retorno líquido para o investidor. As contas são feitas em cêntimos e o lucro líquido é cortado ao cêntimo,
 * como na folha do cliente (47 037,39 × 0,81 = 38 100,2859 → 38 100,28). Um prejuízo não paga imposto.
 */
export function netReturn({ grossProfit, investedCapital, termMonths, kind, caep }: NetReturnInput): NetReturn {
  const rate = taxRate(kind, caep);
  const grossCents = toCents(grossProfit);
  const netCents = grossCents > 0 ? Math.floor((grossCents * (100 - rate)) / 100) : grossCents;
  const netProfit = netCents / 100;
  const cashOnCash = investedCapital > 0 ? (netProfit / investedCapital) * 100 : 0;
  const annualized = termMonths > 0 ? (cashOnCash * 12) / termMonths : 0;
  return { taxRate: rate, tax: (grossCents - netCents) / 100, netProfit, cashOnCash, annualized };
}
