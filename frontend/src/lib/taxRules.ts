// Imposto sobre o lucro de uma operação, conforme a estrutura do investidor.
// Só as 3 taxas da folha de cálculo do cliente (sem derramas, tributação autónoma nem englobamento).
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

/** Taxa de imposto em percentagem: 19 significa 19%. */
export function taxRate(kind: InvestorKind, caep: CaepTerm): number {
  // TODO: confirmar com o cliente a taxa de um particular com CAEP superior a 1 ano (não está na folha). Por defeito, IRS.
  if (kind === "Particular") return IRS_RATE;
  return caep === "Mais de 1 ano" ? IRC_RATE_LONG_CAEP : IRC_RATE;
}

export interface NetReturnInput {
  /** Lucro estimado antes do imposto sobre o lucro, em euros. */
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
  const grossCents = Math.round(grossProfit * 100);
  const netCents = grossCents > 0 ? Math.floor((grossCents * (100 - rate)) / 100) : grossCents;
  const netProfit = netCents / 100;
  const cashOnCash = investedCapital > 0 ? (netProfit / investedCapital) * 100 : 0;
  const annualized = termMonths > 0 ? (cashOnCash * 12) / termMonths : 0;
  return { taxRate: rate, tax: (grossCents - netCents) / 100, netProfit, cashOnCash, annualized };
}
