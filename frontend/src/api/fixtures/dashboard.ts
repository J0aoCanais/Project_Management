import type { DashboardSummary } from "../dashboardApi";

// TODO: trocar pelo endpoint quando existir
export const dashboardFixture: DashboardSummary = {
  stats: {
    openOpportunities: { value: 24, meta: "+5 este mês" },
    activeOperations: { value: 8, meta: "3 em renovação" },
    yearSales: { value: 1285000, meta: "+18,2% vs. 2025" },
    realizedMargin: { value: 286450, meta: "22,3% média" },
  },
  investorCapital: {
    total: 1240000,
    committed: 680000,
    invested: 390000,
    available: 170000,
  },
  funnel: [
    { phase: "Novo", count: 14 },
    { phase: "Contactado", count: 12 },
    { phase: "Análise financeira", count: 10 },
    { phase: "Informação pendente", count: 8 },
    { phase: "Due diligence", count: 6 },
    { phase: "Negociação", count: 4 },
    { phase: "CPCV", count: 2 },
    { phase: "Aprovado", count: 1 },
  ],
  leadsBySource: [
    { source: "Idealista", count: 12 },
    { source: "Anúncio", count: 9 },
    { source: "Indicação", count: 8 },
    { source: "Site", count: 6 },
    { source: "Facebook/Instagram", count: 3 },
  ],
  operationsByPhase: [
    {
      phase: "Em aquisição",
      capitalSubtotal: 158500,
      operations: [
        { id: "OP-2026-002", code: "OP-2026-002", zone: "Solum", capital: 158500, margin: 19.4 },
      ],
    },
    {
      phase: "Em obra",
      capitalSubtotal: 172400,
      operations: [
        { id: "OP-2026-001", code: "OP-2026-001", zone: "Baixa", capital: 172400, margin: 22.8 },
      ],
    },
    {
      phase: "À venda",
      capitalSubtotal: 342800,
      operations: [
        { id: "OP-2026-003", code: "OP-2026-003", zone: "Santa Clara", capital: 342800, margin: 25.1 },
      ],
    },
    {
      phase: "Vendido",
      capitalSubtotal: 248000,
      operations: [
        { id: "OP-2025-014", code: "OP-2025-014", zone: "Olivais", capital: 248000, margin: 21.6 },
      ],
    },
  ],
  alerts: [
    { id: "1", date: "15/11/2026", record: "Marta Ribeiro", description: "Follow-up em atraso", to: "/leads" },
    { id: "2", date: "15/11/2026", record: "Obra Baixa", description: "Desvio de obra: 11,8%", to: "/obras" },
    { id: "3", date: "14/11/2026", record: "Apartamento na Alta", description: "12 dias sem alteração", to: "/oportunidades" },
    { id: "4", date: "13/11/2026", record: "Certidão permanente", description: "Expira em 15 dias", to: "/documentos" },
  ],
};
