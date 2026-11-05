import type { ExtraCost, FinanceValues } from "../api/opportunitiesApi";

export interface FinanceResult {
  /** Soma dos outros custos. */
  other: number;
  /** Comissão imobiliária com IVA. */
  commission: number;
  /** Investimento total. */
  cost: number;
  margin: number;
  /** Margem sobre a venda, em percentagem. */
  marginOnSale: number;
  /** Em percentagem: 17.2 significa 17,2%. */
  roi: number;
  /** Em percentagem. */
  annualRoi: number;
}

/** Cálculo da análise de rentabilidade. As divisões por zero devolvem 0. */
export function calcFinance(values: FinanceValues, extras: ExtraCost[]): FinanceResult {
  const other = extras.reduce((sum, extra) => sum + (extra.value || 0), 0);
  // Multiplica antes de dividir: 355000 × 5% × 1,23 tem de dar 21 832,5 exatos, sem erro de vírgula flutuante.
  const commission = (values.expectedSalePrice * values.commissionPercent * (100 + values.commissionVatPercent)) / 10000;
  const cost = values.purchasePrice + values.imt + values.stampDuty + values.deedCosts + values.workCost + other + commission;
  const margin = values.expectedSalePrice - cost;
  const roi = cost > 0 ? (margin / cost) * 100 : 0;
  const growth = 1 + roi / 100;
  const annualRoi = values.termMonths > 0 && growth >= 0 ? (Math.pow(growth, 12 / values.termMonths) - 1) * 100 : 0;
  const marginOnSale = values.expectedSalePrice > 0 ? (margin / values.expectedSalePrice) * 100 : 0;
  return { other, commission, cost, margin, marginOnSale, roi, annualRoi };
}
