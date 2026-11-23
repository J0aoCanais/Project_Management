import { dashboardFixture } from "../temp";

export interface DashboardSummary {
  stats: {
    openOpportunities: { value: number; meta: string };
    activeOperations: { value: number; meta: string };
    yearSales: { value: number; meta: string };      // euros
    realizedMargin: { value: number; meta: string };  // euros
  };
  investorCapital: { total: number; committed: number; invested: number; available: number };
  funnel: { phase: string; count: number }[];          // 8 fases, pela ordem do prompt.md §7
  leadsBySource: { source: string; count: number }[];  // últimos 7 dias
  operationsByPhase: {
    phase: string;
    capitalSubtotal: number;
    operations: { id: string; code: string; zone: string; capital: number; margin: number }[];
  }[];
  alerts: { id: string; date: string; record: string; description: string; to: string }[];
}

// TODO: trocar pelo endpoint quando existir (GET /api/v1/dashboard)
export async function getDashboard(): Promise<DashboardSummary> {
  await Promise.resolve();
  return dashboardFixture;
}
