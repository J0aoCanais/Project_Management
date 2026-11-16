// TODO(integração): TUDO o que está hard coded no frontend vive neste ficheiro.
// Ao integrar com o backend, remover este ficheiro e, em cada ficheiro que o importa
// (procurar por `temp"`), trocar o import por um hook/endpoint real.
// A lógica que simula o servidor está em api/fixtures/opportunitiesStore.ts (também a remover).

import { calcFinance } from "./lib/finance";
import { OPERATION_PHASES, OPPORTUNITY_PHASES } from "./lib/phases";
import type { DashboardSummary } from "./api/dashboardApi";
import type { Lead, LeadContactEntry } from "./api/leadsApi";
import type { FinanceValues, OpportunityDetail, OpportunityOptions } from "./api/opportunitiesApi";
import type { OperationDetail } from "./api/operationsApi";
import type { LeadSource, MovementCategory, PhaseSetting, Role, SettingsUser } from "./api/settingsApi";
import type { CurrentUser } from "./api/userApi";

// ---- Utilizador autenticado ----

// TODO: trocar pelo endpoint quando existir (utilizador autenticado).
export const currentUserFixture: CurrentUser = {
  id: 1,
  name: "Rodrigo Mendes",
  role: "Administrador",
  email: "rodrigo.mendes@exemplo.pt",
  lastLogin: "2026-11-11T09:30:00.000Z",
};

// ---- Painel ----

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

// ---- Leads ----

// TODO: trocar pelo endpoint quando existir.
export const leadSources = ["Anúncio", "Indicação", "Site", "Idealista", "Redes sociais"];

// TODO: trocar pelo endpoint quando existir (definições).
export const administratorRole = "Administrador";
export const rolesFixture: Role[] = [
  { id: 1, name: administratorRole },
  { id: 2, name: "Gestor" },
  { id: 3, name: "Investidor" },
];
export const settingsUsersFixture: SettingsUser[] = [
  { id: 1, username: "rodrigo.mendes", email: "rodrigo.mendes@exemplo.pt", accessLevel: administratorRole, lastLogin: "2026-11-11T09:30:00.000Z", active: true },
  { id: 2, username: "sofia.lima", email: "sofia.lima@exemplo.pt", accessLevel: rolesFixture[1].name, lastLogin: "2026-11-10T16:20:00.000Z", active: true },
  { id: 3, username: "ana.lourenco", email: "ana.lourenco@exemplo.pt", accessLevel: rolesFixture[2].name, lastLogin: "2026-11-09T12:00:00.000Z", active: true },
  { id: 4, username: "manuel.gouveia", email: "manuel.gouveia@exemplo.pt", accessLevel: rolesFixture[2].name, lastLogin: "2026-10-28T08:15:00.000Z", active: false },
];

export const settingsLeadSourcesFixture: LeadSource[] = leadSources.map((name, index) => ({
  id: index + 1,
  name,
  isActive: true,
}));

export const settingsPhasesFixture: PhaseSetting[] = [...OPPORTUNITY_PHASES, ...OPERATION_PHASES].map((phase, index) => ({
  id: index + 1,
  name: phase.name,
  position: index + 1,
  maxDaysStalled: phase.maxDaysStalled ?? 10,
}));

export const movementDirections = ["Entrada", "Saída"] as const;
export const movementCategoriesFixture: MovementCategory[] = [
  { id: 1, name: "Compra de imóvel", direction: "Saída" },
  { id: 2, name: "Venda de imóvel", direction: "Entrada" },
  { id: 3, name: "Obras", direction: "Saída" },
];

export const leads: Lead[] = [
  { id: 1, contactName: "Marta Ribeiro", phone: "912 345 678", referredBy: "Casa Certa", zone: "Baixa", source: "Anúncio", status: "Nova", message: "Proprietária pretende vender apartamento T2 na Baixa de Coimbra.", createdAt: "2026-11-03T09:00:00.000Z" },
  { id: 2, contactName: "João Noronha", phone: "934 102 889", referredBy: "Particular", zone: "Celas", source: "Indicação", status: "Contactada", message: "Procura uma solução de investimento.", createdAt: "2026-11-02T10:30:00.000Z" },
  { id: 3, contactName: "Carla Mendes", phone: "966 334 120", referredBy: "Habita", zone: "Solum", source: "Site", status: "Qualificada", message: "Tem documentação pronta para análise.", createdAt: "2026-11-01T14:15:00.000Z" },
  { id: 4, contactName: "Rui Valente", phone: "918 422 301", referredBy: "Porta 21", zone: "Alta", source: "Idealista", status: "Convertida", createdAt: "2026-10-30T11:00:00.000Z" },
  { id: 5, contactName: "Sofia Matos", phone: "925 781 442", referredBy: "Particular", zone: "Santa Clara", source: "Redes sociais", status: "Descartada", discardReason: "Fora dos critérios de investimento", createdAt: "2026-10-28T16:45:00.000Z" },
];

export const leadContacts: Record<number, LeadContactEntry[]> = {
  1: [
    { id: 1, date: "2026-11-04T10:00:00.000Z", channel: "Telefone", owner: "Rodrigo Mendes", result: "Atendeu", note: "Visita marcada para 18/11/2026" },
    { id: 2, date: "2026-11-03T15:00:00.000Z", channel: "Email", owner: "Rodrigo Mendes", result: "Enviado", note: "Pedido de documentação" },
  ],
};

/** Contactos existentes que se podem escolher em "Nova lead". */
export const leadContactOptions = ["Ana Lourenço", "Rodrigo Mendes", "Joana Costa"];

/** Linhas mostradas ao carregar um .xlsx na importação, que ainda não é lido a sério. */
export const leadImportSample: string[][] = [
  ["Marta Ribeiro", "Casa Certa", "Baixa", "912 345 678", "Anúncio", "Nova", "03/11/2026"],
  ["João Noronha", "Particular", "Celas", "934 102 889", "Indicação", "Nova", "03/11/2026"],
  ["Carla Mendes", "Habita", "Solum", "966 334 120", "Site", "Nova", "03/11/2026"],
  ["Rui Valente", "Porta 21", "Alta", "918 422 301", "Idealista", "Nova", "03/11/2026"],
  ["Sofia Matos", "Particular", "Santa Clara", "925 781 442", "Redes sociais", "Nova", "03/11/2026"],
];

// ---- Oportunidades ----

// TODO: trocar pelo endpoint quando existir.

const DAY = 24 * 60 * 60 * 1000;

/** As datas são relativas a hoje para os "dias nesta fase" e o histórico fazerem sentido em qualquer dia. */
function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY).toISOString();
}

/** Valores iniciais de uma oportunidade sem análise: a obra fica com o que falta para chegar ao lucro estimado. */
export function defaultFinance(askingPrice: number, vvr: number, estimatedProfit?: number): FinanceValues {
  const base: FinanceValues = {
    purchasePrice: askingPrice,
    imt: 0,
    stampDuty: 0,
    deedCosts: 0,
    workCost: 0,
    expectedSalePrice: vvr,
    commissionPercent: 5,
    commissionVatPercent: 23,
    termMonths: 12,
  };
  if (estimatedProfit === undefined) return base;
  const { margin } = calcFinance(base, []);
  return { ...base, workCost: Math.max(0, Math.round(margin - estimatedProfit)) };
}

/** Histórico plausível até à fase atual, do mais recente para o mais antigo. */
function historyUpTo(phaseIndex: number, daysInPhase: number): OpportunityDetail["phaseHistory"] {
  const history: OpportunityDetail["phaseHistory"] = [];
  for (let index = phaseIndex; index > 0; index--) {
    history.push({
      from: OPPORTUNITY_PHASES[index - 1].name,
      to: OPPORTUNITY_PHASES[index].name,
      date: daysAgo(daysInPhase + (phaseIndex - index) * 4),
    });
  }
  return history;
}

function simpleOpportunity(
  card: Pick<OpportunityDetail, "id" | "title" | "zone" | "typology" | "askingPrice" | "vvr" | "estimatedProfit" | "phaseIndex" | "daysInPhase" | "owner" | "contactName">,
  property: OpportunityDetail["property"],
): OpportunityDetail {
  const createdDaysAgo = card.daysInPhase + card.phaseIndex * 4;
  return {
    ...card,
    property,
    updatedAt: daysAgo(card.daysInPhase),
    finance: defaultFinance(card.askingPrice, card.vvr, card.estimatedProfit),
    extraCosts: [],
    phaseHistory: historyUpTo(card.phaseIndex, card.daysInPhase),
    activity: [{ date: daysAgo(createdDaysAgo), text: "Oportunidade criada" }],
    documents: [],
  };
}

const rodrigo = { name: "Rodrigo Mendes" };
const sofia = { name: "Sofia Lima" };

const baixaDeCoimbra: OpportunityDetail = {
  id: 3,
  title: "Baixa de Coimbra",
  zone: "Baixa",
  typology: "T2",
  askingPrice: 128000,
  vvr: 215000,
  estimatedProfit: 39200,
  phaseIndex: 2,
  daysInPhase: 2,
  owner: rodrigo,
  contactName: "Marta Ribeiro",
  updatedAt: daysAgo(0),
  property: {
    code: "IM-1042",
    areaM2: 86,
    visitDate: "2026-11-18",
    notes: "Imóvel com boa luz natural e excelente localização. Necessita renovação integral de cozinha, instalações sanitárias e rede elétrica.",
    constructionYear: 1978,
    condition: "A renovar",
    energyCertificate: "C",
    photos: [
      { url: "https://images.unsplash.com/photo-1653339403812-00659169dd73?auto=format&fit=crop&w=1200&q=85", caption: "Cozinha – estado inicial" },
      { url: "https://images.unsplash.com/photo-1543926618-a1616b2b8575?auto=format&fit=crop&w=1200&q=85", caption: "Sala – estado inicial" },
    ],
  },
  finance: {
    purchasePrice: 220000,
    imt: 8400,
    stampDuty: 1760,
    deedCosts: 1250,
    workCost: 58000,
    expectedSalePrice: 355000,
    commissionPercent: 5,
    commissionVatPercent: 23,
    termMonths: 10,
  },
  extraCosts: [
    { id: "extra-1", label: "Licenças e projeto", value: 3500 },
    { id: "extra-2", label: "IMI e condomínio durante a operação", value: 1800 },
    { id: "extra-3", label: "Seguro", value: 1200 },
  ],
  phaseHistory: [
    { from: "Contactado", to: "Análise financeira", date: daysAgo(2), note: "Pressupostos iniciais lançados" },
    { from: "Novo", to: "Contactado", date: daysAgo(6), note: "Primeiro contacto com a proprietária" },
  ],
  activity: [
    { date: daysAgo(0), text: "Análise financeira atualizada" },
    { date: daysAgo(1), text: "Contacto confirmou a visita" },
    { date: daysAgo(8), text: "Oportunidade criada" },
  ],
  documents: [
    { id: "doc-1", name: "CPCV_compra_OP001.pdf", type: "CPCV", propertyCode: "IM-1042", entity: "OP-2026-001", sizeBytes: 1887437, status: "Válido" },
    { id: "doc-2", name: "Certidão_permanente.pdf", type: "Certidão permanente", propertyCode: "IM-1042", entity: "IM-1042", sizeBytes: 860160, validUntil: "2026-11-22", status: "A expirar" },
    { id: "doc-3", name: "Caderneta_predial_IM1042.pdf", type: "Caderneta predial", propertyCode: "IM-1042", entity: "IM-1042", sizeBytes: 419840, status: "Válido" },
    { id: "doc-4", name: "Orçamento_electricidade.xlsx", type: "Orçamento de obra", propertyCode: "IM-1042", entity: "Obra OP-2026-001", sizeBytes: 229376, status: "Válido" },
  ],
};

export const opportunitiesFixture: OpportunityDetail[] = [
  simpleOpportunity(
    { id: 1, title: "Apartamento na Alta", zone: "Alta", typology: "T2", askingPrice: 285000, vvr: 410000, estimatedProfit: 61500, phaseIndex: 0, daysInPhase: 3, owner: rodrigo, contactName: "João Noronha" },
    { code: "IM-1029", areaM2: 91, condition: "A renovar" },
  ),
  simpleOpportunity(
    { id: 2, title: "Rua do Brasil", zone: "Celas", typology: "T3", askingPrice: 220000, vvr: 345000, estimatedProfit: 52700, phaseIndex: 1, daysInPhase: 8, owner: sofia, contactName: "Carla Mendes" },
    { code: "IM-1038", areaM2: 124, condition: "Habitável" },
  ),
  baixaDeCoimbra,
  simpleOpportunity(
    { id: 4, title: "Quinta da Portela", zone: "Olivais", typology: "T1", askingPrice: 145000, vvr: 225000, estimatedProfit: 33800, phaseIndex: 4, daysInPhase: 12, owner: sofia },
    { code: "IM-1031", areaM2: 58, condition: "A renovar" },
  ),
  simpleOpportunity(
    { id: 5, title: "Moradia na Solum", zone: "Solum", typology: "T4", askingPrice: 395000, vvr: 585000, estimatedProfit: 86400, phaseIndex: 7, daysInPhase: 5, owner: rodrigo, contactName: "Rui Valente" },
    { code: "IM-1018", areaM2: 210, condition: "A renovar" },
  ),
];

// TODO: trocar pelo endpoint quando existir (operações).
export const operationsFixture: OperationDetail[] = [
  {
    id: 100,
    code: "OP-2026-001",
    title: "T2 · Baixa, Coimbra",
    zone: "Baixa",
    typology: "T2",
    realPurchasePrice: 128000,
    advertisedPrice: 239000,
    expectedMargin: 111000,
    phaseIndex: 2,
    daysInPhase: 8,
    owner: { name: "Rodrigo Mendes" },
    propertyCode: "IM-1042",
    areaM2: 86,
    buyerName: "Marta Ribeiro",
    saleDeedDate: undefined,
    phaseHistory: [
      { from: "Em aquisição", to: "Adquirido", date: daysAgo(22), note: "Escritura de compra concluída" },
      { from: "Adquirido", to: "Em obra", date: daysAgo(8), note: "Início dos trabalhos" },
    ],
    activity: [
      { date: daysAgo(1), text: "Orçamento da obra atualizado" },
      { date: daysAgo(8), text: "Fase alterada para Em obra" },
      { date: daysAgo(22), text: "Imóvel adquirido" },
    ],
    documents: [
      { id: "op-doc-1", name: "Escritura_compra.pdf", type: "Escritura", propertyCode: "IM-1042", entity: "OP-2026-001", sizeBytes: 1200000, status: "Válido" },
    ],
    constructionWorks: [{ id: 1, code: "OB-2026-003", name: "Renovação integral", status: "Em curso", startDate: "2026-11-03", endDate: "2026-11-30", budget: 45800, spent: 31970 }],
    investments: [
      { investorId: 1, investor: "Ana Lourenço", amount: 80000, sharePercent: 46.4, returnType: "Retorno fixo", rate: 8 },
      { investorId: 2, investor: "Manuel Gouveia", amount: 52000, sharePercent: 30.2, returnType: "Participação", rate: 25 },
    ],
  },
  {
    id: 101,
    code: "OP-2026-002",
    title: "T1 · Solum, Coimbra",
    zone: "Solum",
    typology: "T1",
    realPurchasePrice: 115000,
    advertisedPrice: 158500,
    expectedMargin: 43500,
    phaseIndex: 0,
    daysInPhase: 4,
    owner: { name: "Sofia Lima" },
    propertyCode: "IM-1051",
    areaM2: 62,
    buyerName: "",
    phaseHistory: [],
    activity: [{ date: daysAgo(4), text: "Operação criada" }],
    documents: [],
    constructionWorks: [],
    investments: [],
  },
  {
    id: 102,
    code: "OP-2026-003",
    title: "T3 · Santa Clara, Coimbra",
    zone: "Santa Clara",
    typology: "T3",
    realPurchasePrice: 274000,
    advertisedPrice: 342800,
    finalSalePrice: 342800,
    expectedMargin: 68800,
    phaseIndex: 5,
    daysInPhase: 2,
    owner: { name: "Rodrigo Mendes" },
    propertyCode: "IM-1053",
    areaM2: 141,
    buyerName: "Joana Costa",
    saleDeedDate: "2026-11-18",
    phaseHistory: [{ from: "À venda", to: "Vendido", date: daysAgo(2) }],
    activity: [{ date: daysAgo(2), text: "Proposta de compra aceite" }],
    documents: [],
    constructionWorks: [],
    investments: [],
  },
  {
    id: 103,
    code: "OP-2025-014",
    title: "T2 · Olivais, Coimbra",
    zone: "Olivais",
    typology: "T2",
    realPurchasePrice: 198000,
    advertisedPrice: 248000,
    finalSalePrice: 248000,
    expectedMargin: 50000,
    phaseIndex: 6,
    daysInPhase: 1,
    owner: { name: "Sofia Lima" },
    propertyCode: "IM-0987",
    areaM2: 104,
    buyerName: "João Pereira",
    saleDeedDate: "2026-11-10",
    phaseHistory: [{ from: "Vendido", to: "Fechado", date: daysAgo(1) }],
    activity: [{ date: daysAgo(1), text: "Operação fechada" }],
    documents: [],
    constructionWorks: [],
    investments: [],
  },
];

export const opportunityOptionsFixture: OpportunityOptions = {
  zones: ["Baixa", "Alta", "Celas", "Solum", "Santa Clara", "Olivais"],
  managers: [rodrigo.name, sofia.name],
  leads: [
    { id: 1, name: "Marta Ribeiro" },
    { id: 2, name: "João Noronha" },
    { id: 3, name: "Carla Mendes" },
  ],
};

// ---- Listas e valores fixos da interface ----

// TODO: trocar pelo endpoint de notificações.
export const hasUnreadNotifications = true;

// TODO: trocar pelo endpoint (estados de lead).
export const leadStatusOptions = ["Nova", "Contactada", "Qualificada", "Convertida", "Descartada"];
export const leadStatusChangeOptions = ["Nova", "Contactada", "Qualificada"];

// TODO: trocar pelo endpoint (zonas).
export const leadZoneOptions = ["Baixa", "Alta", "Celas", "Solum", "Santa Clara", "Olivais"];

// TODO: trocar pelo endpoint (motivos de descarte).
export const discardReasonOptions = ["Sem interesse do proprietário", "Fora dos critérios de investimento", "Preço não negociável"];

// TODO: trocar pelo endpoint (canais de contacto).
export const contactChannelOptions = ["Telefone", "Email", "Reunião"];

// TODO: trocar pelo endpoint (tipologias).
export const typologyOptions = ["T0", "T1", "T2", "T3", "T4", "T5+"];

// TODO: trocar pelo endpoint (tipos de documento).
export const documentTypeOptions = ["Caderneta predial", "Certidão permanente", "Orçamento de obra", "Planta", "Licença de utilização", "Certificado energético", "Outro"];
