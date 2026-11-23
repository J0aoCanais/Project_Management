// TODO(integração): TUDO o que está hard coded no frontend vive neste ficheiro.
// Ao integrar com o backend, remover este ficheiro e, em cada ficheiro que o importa
// (procurar por `temp"`), trocar o import por um hook/endpoint real.
// A lógica que simula o servidor está em api/fixtures/*Store.ts (também a remover).

import { calcFinance } from "./lib/finance";
import { OPERATION_PHASES, OPPORTUNITY_PHASES } from "./lib/phases";
import type { DashboardSummary } from "./api/dashboardApi";
import type { DocumentOwner, DocumentOwnerKind, DocumentRecord } from "./api/documentsApi";
import type { MovementInput } from "./api/financeApi";
import type { PropertyDetail } from "./api/propertiesApi";
import type { Lead, LeadContactEntry } from "./api/leadsApi";
import type { InvestorRecord } from "./api/investorsApi";
import type { FinanceValues, OpportunityDetail, OpportunityOptions } from "./api/opportunitiesApi";
import type { OperationDetail } from "./api/operationsApi";
import type { LeadSource, MovementCategory, PhaseSetting, Role, SettingsUser } from "./api/settingsApi";
import type { CurrentUser } from "./api/userApi";
import type { WorkDetail, WorkOptions } from "./api/worksApi";
import { BUDGET_CATEGORIES, PHOTO_STAGES, WORK_DOCUMENT_TYPES, WORK_STATES } from "./lib/workRules";

// TODO: trocar pelo endpoint (zonas). Usado por leads, oportunidades e imóveis.
export const zoneOptions = ["Baixa", "Alta", "Celas", "Solum", "Santa Clara", "Olivais"];

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
  { id: 4, name: "Custo de estrutura", direction: "Saída" },
  { id: 5, name: "Juros", direction: "Saída" },
  { id: 6, name: "Comissões", direction: "Saída" },
  { id: 7, name: "Investimento", direction: "Entrada" },
  { id: 8, name: "Impostos", direction: "Saída" },
  { id: 9, name: "Financiamento bancário", direction: "Entrada" },
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
    id: 1042,
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
};

export const opportunitiesFixture: OpportunityDetail[] = [
  simpleOpportunity(
    { id: 1, title: "Apartamento na Alta", zone: "Alta", typology: "T2", askingPrice: 285000, vvr: 410000, estimatedProfit: 61500, phaseIndex: 0, daysInPhase: 3, owner: rodrigo, contactName: "João Noronha" },
    { id: 1029, code: "IM-1029", areaM2: 91, condition: "A renovar" },
  ),
  simpleOpportunity(
    { id: 2, title: "Rua do Brasil", zone: "Celas", typology: "T3", askingPrice: 220000, vvr: 345000, estimatedProfit: 52700, phaseIndex: 1, daysInPhase: 8, owner: sofia, contactName: "Carla Mendes" },
    { id: 1038, code: "IM-1038", areaM2: 124, condition: "Habitável" },
  ),
  baixaDeCoimbra,
  simpleOpportunity(
    { id: 4, title: "Quinta da Portela", zone: "Olivais", typology: "T1", askingPrice: 145000, vvr: 225000, estimatedProfit: 33800, phaseIndex: 4, daysInPhase: 12, owner: sofia },
    { id: 1031, code: "IM-1031", areaM2: 58, condition: "A renovar" },
  ),
  simpleOpportunity(
    { id: 5, title: "Moradia na Solum", zone: "Solum", typology: "T4", askingPrice: 395000, vvr: 585000, estimatedProfit: 86400, phaseIndex: 7, daysInPhase: 5, owner: rodrigo, contactName: "Rui Valente" },
    { id: 1018, code: "IM-1018", areaM2: 210, condition: "A renovar" },
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
    constructionWorks: [],
    investments: [],
  },
];

export const opportunityOptionsFixture: OpportunityOptions = {
  zones: zoneOptions,
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


// TODO: trocar pelo endpoint (motivos de descarte).
export const discardReasonOptions = ["Sem interesse do proprietário", "Fora dos critérios de investimento", "Preço não negociável"];

// TODO: trocar pelo endpoint (canais de contacto).
export const contactChannelOptions = ["Telefone", "Email", "Reunião"];

// TODO: trocar pelo endpoint (tipologias).
export const typologyOptions = ["T0", "T1", "T2", "T3", "T4", "T5+"];

// ---- Contactos ----

// TODO: trocar pelo endpoint (canais de consentimento RGPD).
export const consentChannelOptions = ["Formulário do website", "Email", "Telefone", "Presencial"];

/** Linhas mostradas ao carregar um .xlsx na importação de contactos, que ainda não é lido a sério. */
export const contactImportSample: string[][] = [
  ["Rita Carvalho", "Carvalho & Filhos", "rita.carvalho@exemplo.pt", "913 220 118", "Celas"],
  ["Jorge Pinto", "", "jorge.pinto@exemplo.pt", "926 401 733", "Solum"],
  ["Marta Ribeiro", "Casa Certa", "marta.ribeiro@exemplo.pt", "912 345 678", "Baixa"],
];

// ---- Investidores ----

// TODO: trocar pelo endpoint (perfis de risco, estados da relação, tipos de retorno).
export const riskProfileOptions = ["Conservador", "Moderado", "Agressivo"];
export const relationStatusOptions = ["Ativo", "Prospeção", "Inativo"];
export const returnTypeOptions = ["Juro fixo", "Participação nos lucros"];

// TODO: trocar pelo endpoint das operações quando existir.
export const investmentOperationOptions = ["OP-2025-014", "OP-2026-001", "OP-2026-002", "OP-2026-003"];

// TODO: trocar pelo endpoint quando existir (ainda não há backend de investidores). Ficam só em memória.
export const investorsFixture: InvestorRecord[] = [
  {
    id: 5, name: "Ana Lourenço", email: "ana.lourenco@exemplo.pt", phone: "912 830 445", company: "", zone: "Alta",
    profile: { availableCapital: 180000, riskProfile: "Moderado", preferredZones: ["Alta", "Baixa"], minAmount: 50000, maxAmount: 120000, preferredTerms: "8 a 18 meses, retorno mínimo de 8%", relationStatus: "Ativo" },
    investments: [
      { id: 1, operationCode: "OP-2026-001", committedValue: 80000, participationPercent: 46.4, returnType: "Juro fixo", returnRate: 8, agreementDate: "2026-11-08" },
      { id: 2, operationCode: "OP-2025-014", committedValue: 65000, participationPercent: 26.2, returnType: "Juro fixo", returnRate: 8, agreementDate: "2025-06-12" },
    ],
  },
  {
    id: 6, name: "Manuel Gouveia", email: "manuel.gouveia@exemplo.pt", phone: "934 112 887", company: "Gouveia Capital", zone: "Celas",
    profile: { availableCapital: 250000, riskProfile: "Agressivo", preferredZones: ["Celas", "Solum"], minAmount: 40000, maxAmount: 150000, preferredTerms: "Até 24 meses", relationStatus: "Ativo" },
    investments: [{ id: 3, operationCode: "OP-2026-001", committedValue: 52000, participationPercent: 30.2, returnType: "Participação nos lucros", returnRate: 25, agreementDate: "2026-11-09" }],
  },
  {
    id: 7, name: "Teresa Faria", email: "teresa.faria@exemplo.pt", phone: "961 309 210", company: "", zone: "Baixa",
    profile: { availableCapital: 95000, riskProfile: "Conservador", preferredZones: ["Baixa"], minAmount: 20000, maxAmount: 60000, preferredTerms: "Juro fixo, até 12 meses", relationStatus: "Prospeção" },
    investments: [],
  },
  {
    id: 8, name: "Pedro Alvim", email: "pedro.alvim@exemplo.pt", phone: "922 874 601", company: "", zone: "Solum",
    profile: { availableCapital: 120000, riskProfile: "Moderado", preferredZones: ["Solum", "Santa Clara"], minAmount: 30000, maxAmount: 90000, preferredTerms: "", relationStatus: "Inativo" },
    investments: [],
  },
];

// ---- Datas relativas a hoje ----

/** Dia "aaaa-mm-dd" a `offset` dias de hoje (negativo = passado), para os estados fazerem sentido em qualquer dia. */
function dayFromToday(offset: number): string {
  const date = new Date(Date.now() + offset * DAY);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ---- Imóveis ----

// TODO: trocar pelo endpoint (tipos de imóvel).
export const propertyTypeOptions = ["Apartamento", "Moradia", "Prédio", "Loja", "Terreno"];

// TODO: trocar pelo endpoint quando existir. A margem estimada e as ligações são calculadas pelo servidor simulado.
export const propertiesFixture: Omit<PropertyDetail, "estimatedProfit" | "related">[] = [
  { id: 1042, code: "IM-1042", address: "Rua da Sofia, 82, 2.º Dto., Coimbra", zone: "Baixa", typology: "T2", propertyType: "Apartamento", areaM2: 86, askingPrice: 128000, vvr: 215000, visitDate: dayFromToday(2), constructionYear: 1978, condition: "A renovar", energyCertificate: "C", sourceUrl: "https://www.exemplo.pt/anuncios/im-1042", notes: "Boa luz natural. Necessita renovação integral de cozinha, casas de banho e rede elétrica." },
  { id: 1029, code: "IM-1029", address: "Rua da Alta, 14, Coimbra", zone: "Alta", typology: "T2", propertyType: "Apartamento", areaM2: 91, askingPrice: 285000, vvr: 410000, constructionYear: 1962, condition: "A renovar" },
  { id: 1038, code: "IM-1038", address: "Rua do Brasil, 120, Celas", zone: "Celas", typology: "T3", propertyType: "Apartamento", areaM2: 124, askingPrice: 220000, vvr: 345000, visitDate: dayFromToday(-5), constructionYear: 1985, condition: "Habitável" },
  { id: 1031, code: "IM-1031", address: "Quinta da Portela, Lote 7, Olivais", zone: "Olivais", typology: "T1", propertyType: "Apartamento", areaM2: 58, askingPrice: 145000, vvr: 225000, constructionYear: 1999, condition: "A renovar" },
  { id: 1018, code: "IM-1018", address: "Rua da Solum, 33, Coimbra", zone: "Solum", typology: "T4", propertyType: "Moradia", areaM2: 210, askingPrice: 395000, vvr: 585000, visitDate: dayFromToday(-20), constructionYear: 1971, condition: "A renovar", energyCertificate: "D" },
  { id: 1051, code: "IM-1051", address: "Rua Ferreira Borges, 45, Coimbra", zone: "Solum", typology: "T1", propertyType: "Apartamento", areaM2: 62, askingPrice: 115000, vvr: 158500, visitDate: dayFromToday(-70), constructionYear: 1940, condition: "A renovar" },
  { id: 1053, code: "IM-1053", address: "Rua António Augusto Gonçalves, 9, Coimbra", zone: "Santa Clara", typology: "T3", propertyType: "Apartamento", areaM2: 141, askingPrice: 274000, vvr: 342800, constructionYear: 1990, condition: "Renovado", energyCertificate: "B" },
  { id: 987, code: "IM-0987", address: "Rua Dom João III, 21, Coimbra", zone: "Olivais", typology: "T2", propertyType: "Apartamento", areaM2: 104, askingPrice: 198000, vvr: 248000, constructionYear: 1980, condition: "Renovado" },
];

// ---- Finanças ----

// TODO: trocar pelo endpoint quando existir.
export const financingsFixture = [
  { id: 1, name: "Crédito bancário · OP-2026-001", amount: 120000 },
  { id: 2, name: "Linha de tesouraria", amount: 30000 },
];

// TODO: trocar pelo endpoint quando existir. O estado é calculado pelo servidor simulado a partir das datas.
export const movementsFixture: (MovementInput & { id: number })[] = [
  { id: 1, categoryId: 3, amount: 2000, expectedDate: dayFromToday(2), link: { kind: "budgetItem", id: 2 }, notes: "Segunda tranche da eletricidade" },
  { id: 2, categoryId: 7, amount: 45000, expectedDate: dayFromToday(-4), effectiveDate: dayFromToday(-4), link: { kind: "investment", id: 3 }, notes: "Tranche do investidor" },
  { id: 3, categoryId: 4, amount: 390, expectedDate: dayFromToday(-8), effectiveDate: dayFromToday(-8), notes: "Software de gestão" },
  { id: 4, categoryId: 2, amount: 24800, expectedDate: dayFromToday(4), link: { kind: "operation", id: 103 }, notes: "Sinal do CPCV de venda" },
  { id: 5, categoryId: 1, amount: 172400, expectedDate: dayFromToday(-40), effectiveDate: dayFromToday(-38), link: { kind: "operation", id: 100 }, notes: "Escritura de compra" },
  { id: 6, categoryId: 8, amount: 8400, expectedDate: dayFromToday(-40), effectiveDate: dayFromToday(-40), link: { kind: "operation", id: 100 }, notes: "IMT" },
  { id: 7, categoryId: 3, amount: 4000, expectedDate: dayFromToday(-6), link: { kind: "budgetItem", id: 3 }, notes: "Fatura da canalização" },
  { id: 8, categoryId: 9, amount: 90000, expectedDate: dayFromToday(-36), effectiveDate: dayFromToday(-35), link: { kind: "financing", id: 1 }, notes: "Desembolso do crédito" },
  { id: 9, categoryId: 5, amount: 650, expectedDate: dayFromToday(-5), effectiveDate: dayFromToday(-5), link: { kind: "financing", id: 1 } },
  { id: 10, categoryId: 3, amount: 3000, expectedDate: dayFromToday(-20), effectiveDate: dayFromToday(-21), link: { kind: "budgetItem", id: 2 }, notes: "Sinal ao empreiteiro (eletricidade)" },
  { id: 11, categoryId: 7, amount: 80000, expectedDate: dayFromToday(-60), effectiveDate: dayFromToday(-60), link: { kind: "investment", id: 1 }, notes: "Capital comprometido" },
  { id: 12, categoryId: 2, amount: 248000, expectedDate: dayFromToday(25), link: { kind: "operation", id: 103 }, notes: "Escritura de venda" },
  { id: 13, categoryId: 6, amount: 12400, expectedDate: dayFromToday(25), link: { kind: "operation", id: 103 }, notes: "Comissão da agência" },
];

// ---- Documentos ----

// TODO: trocar pelo endpoint (tipos de documento por entidade).
export const documentTypesByOwner: Record<DocumentOwnerKind, string[]> = {
  opportunity: ["Caderneta predial", "Certidão permanente", "Orçamento de obra", "Planta", "Licença de utilização", "Certificado energético", "Outro"],
  property: ["Caderneta predial", "Certidão permanente", "Licença de utilização", "Certificado energético", "Planta", "Outro"],
  operation: ["CPCV", "Escritura", "Contrato", "Certidão permanente", "Outro"],
  work: [...WORK_DOCUMENT_TYPES],
  investment: ["Contrato de investimento", "Comprovativo de transferência", "Outro"],
  movement: ["Fatura", "Recibo", "Comprovativo de pagamento", "Outro"],
};

// TODO: trocar pelo endpoint (documentos obrigatórios por entidade, geridos em Definições).
export const requiredDocumentTypes: Partial<Record<DocumentOwnerKind, string[]>> = {
  property: ["Caderneta predial", "Certidão permanente", "Certificado energético"],
};

function documentFixture(id: number, name: string, type: string, owner: DocumentOwner, sizeBytes: number, uploadedDaysAgo: number, expiryOffset?: number, photoStage?: string): Omit<DocumentRecord, "owner"> & { owner: DocumentOwner } {
  return {
    id,
    name,
    type,
    fileType: (name.split(".").pop() ?? "").toUpperCase(),
    sizeBytes,
    fileHash: `sha256-exemplo-${id.toString(16).padStart(8, "0")}`,
    uploadedAt: daysAgo(uploadedDaysAgo),
    expiryDate: expiryOffset === undefined ? undefined : dayFromToday(expiryOffset),
    photoStage,
    owner,
  };
}

// TODO: trocar pelo endpoint quando existir. O nome do dono é resolvido pelo servidor simulado.
export const documentsFixture = [
  documentFixture(1, "CPCV_compra_OP001.pdf", "CPCV", { kind: "operation", id: 100 }, 1887437, 45),
  documentFixture(2, "Certidão_permanente_IM1042.pdf", "Certidão permanente", { kind: "property", id: 1042 }, 860160, 9, 6),
  documentFixture(3, "Caderneta_predial_IM1042.pdf", "Caderneta predial", { kind: "property", id: 1042 }, 419840, 9),
  documentFixture(4, "Orçamento_eletricidade.xlsx", "Orçamento de obra", { kind: "work", id: 1 }, 229376, 25),
  documentFixture(20, "Caderno_Encargos_Obra_Baixa.pdf", "Orçamento de obra", { kind: "work", id: 1 }, 1420000, 10),
  documentFixture(21, "Planta_Intervencao_Baixa.pdf", "Planta", { kind: "work", id: 1 }, 2840000, 11),
  documentFixture(22, "Licenca_Camara_Obras_Baixa.pdf", "Licença", { kind: "work", id: 1 }, 920000, 12, 75),
  documentFixture(23, "Sala_Antes_Demolicao.jpg", "Fotografia de obra", { kind: "work", id: 1 }, 3400000, 13, undefined, "Antes"),
  documentFixture(24, "Reforco_Estrutural_Cozinha.jpg", "Fotografia de obra", { kind: "work", id: 1 }, 2900000, 14, undefined, "Durante"),
  documentFixture(25, "Fatura_Adiantamento_Silva.pdf", "Fatura", { kind: "work", id: 1 }, 310000, 15),
  documentFixture(26, "Orcamento_Geral_Solum.xlsx", "Orçamento de obra", { kind: "work", id: 2 }, 450000, 16),
  documentFixture(27, "Foto_Frente_Inicio.jpg", "Fotografia de obra", { kind: "work", id: 2 }, 2200000, 17, undefined, "Antes"),
  documentFixture(28, "Projeto_Arquitetura_SantaClara.pdf", "Planta", { kind: "work", id: 3 }, 5600000, 18),
  documentFixture(29, "Auto_Recepcao_Obra_Olivais.pdf", "Outro", { kind: "work", id: 4 }, 620000, 19),
  documentFixture(30, "Sala_Final.jpg", "Fotografia de obra", { kind: "work", id: 4 }, 3100000, 20, undefined, "Depois"),
  documentFixture(5, "Planta_IM1042.pdf", "Planta", { kind: "opportunity", id: 3 }, 1258291, 6),
  documentFixture(6, "Relatório_visita_Baixa.pdf", "Outro", { kind: "opportunity", id: 3 }, 342016, 2),
  documentFixture(7, "Contrato_investimento_OP001.pdf", "Contrato de investimento", { kind: "investment", id: 1 }, 1003520, 60),
  documentFixture(12, "Contrato_investimento_OP014.pdf", "Contrato de investimento", { kind: "investment", id: 2 }, 954368, 400),
  documentFixture(13, "Acordo_participacao_OP001.pdf", "Contrato de investimento", { kind: "investment", id: 3 }, 870400, 58),
  documentFixture(8, "Fatura_sinal_eletricidade.pdf", "Fatura", { kind: "movement", id: 10 }, 188416, 21),
  documentFixture(9, "Certificado_energético_IM1018.pdf", "Certificado energético", { kind: "property", id: 1018 }, 655360, 400, -10),
  documentFixture(10, "Escritura_compra_OP001.pdf", "Escritura", { kind: "operation", id: 100 }, 2516582, 38),
  documentFixture(11, "Licença_utilização_IM1053.pdf", "Licença de utilização", { kind: "property", id: 1053 }, 512000, 80, 400),
];
// ---- Obras ----

// TODO: trocar pelo endpoint quando existir.
/** Operações que se podem escolher numa obra: as mesmas de Operações (tarefa 05). */
export const workOperationOptions = operationsFixture.map((operation) => ({ id: operation.id, code: operation.code, name: `${operation.code} · ${operation.zone}` }));

export const workContractorOptions = [
  { id: 1, name: "Construções Silva & Filhos, Lda." },
  { id: 2, name: "Reabilita Coimbra, Unipessoal" },
  { id: 3, name: "Instalações Elétricas Mondego" },
  { id: 4, name: "Climatização do Centro" },
  { id: 5, name: "Carpintaria Moderna, Lda." },
  { id: 6, name: "Pinturas & Remodelações Beira" },
];

export const workOptionsFixture: WorkOptions = {
  operations: workOperationOptions,
  states: [...WORK_STATES],
  categories: [...BUDGET_CATEGORIES],
  contractors: workContractorOptions,
  documentTypes: [...WORK_DOCUMENT_TYPES],
  photoStages: [...PHOTO_STAGES],
};

export const worksFixture: WorkDetail[] = [
  {
    id: 1,
    name: "Obra Baixa",
    state: "Atrasada",
    plannedStartDate: "2026-08-01",
    plannedEndDate: "2026-11-01",
    realStartDate: "2026-08-10",
    operationId: 100,
    operationCode: "OP-2026-001",
    operationName: "Baixa de Coimbra",
    notes: "Remodelação profunda de apartamento T2. Atraso devido a reforço estrutural não previsto na parede da cozinha.",
    totalBudget: 42500,
    totalContracted: 42800,
    totalExecuted: 24500,
    totalInvoiced: 21000,
    totalPaid: 19500,
    executedPercent: 57.2,
    budgetItems: [
      {
        id: 1,
        categoryName: "Demolições e Estrutura",
        contractorId: 1,
        contractorName: "Construções Silva & Filhos, Lda.",
        budgetedValue: 8000,
        contractedValue: 8500,
        executedValue: 8500,
        invoicedValue: 8500,
        paidValue: 8500,
      },
      {
        id: 2,
        categoryName: "Eletricidade e ITED",
        contractorId: 3,
        contractorName: "Instalações Elétricas Mondego",
        budgetedValue: 6500,
        contractedValue: 6200,
        executedValue: 5000,
        invoicedValue: 4000,
        paidValue: 3000,
      },
      {
        id: 3,
        categoryName: "Canalização e Climatização",
        contractorId: 4,
        contractorName: "Climatização do Centro",
        budgetedValue: 9000,
        contractedValue: 8800,
        executedValue: 6000,
        invoicedValue: 5000,
        paidValue: 4500,
      },
      {
        id: 4,
        categoryName: "Carpintarias e Caixilharias",
        contractorId: 5,
        contractorName: "Carpintaria Moderna, Lda.",
        budgetedValue: 12000,
        contractedValue: 12500,
        executedValue: 4000,
        invoicedValue: 3500,
        paidValue: 3500,
      },
      {
        id: 5,
        categoryName: "Pinturas e Acabamentos",
        contractorId: 6,
        contractorName: "Pinturas & Remodelações Beira",
        budgetedValue: 7000,
        contractedValue: 6800,
        executedValue: 1000,
        invoicedValue: 0,
        paidValue: 0,
      },
    ],
  },
  {
    id: 2,
    name: "Obra Solum - Renovações",
    state: "Em curso",
    plannedStartDate: "2026-10-01",
    plannedEndDate: "2027-01-31",
    realStartDate: "2026-10-05",
    operationId: 101,
    operationCode: "OP-2026-002",
    operationName: "Solum",
    notes: "Atualização de redes e acabamentos da fração Solum.",
    totalBudget: 15500,
    totalContracted: 15200,
    totalExecuted: 9300,
    totalInvoiced: 7800,
    totalPaid: 7800,
    executedPercent: 61.2,
    budgetItems: [
      {
        id: 6,
        categoryName: "Demolições e Estrutura",
        contractorId: 2,
        contractorName: "Reabilita Coimbra, Unipessoal",
        budgetedValue: 5000,
        contractedValue: 4800,
        executedValue: 4800,
        invoicedValue: 4800,
        paidValue: 4800,
      },
      {
        id: 7,
        categoryName: "Eletricidade e ITED",
        contractorId: 3,
        contractorName: "Instalações Elétricas Mondego",
        budgetedValue: 4500,
        contractedValue: 4500,
        executedValue: 3000,
        invoicedValue: 2000,
        paidValue: 2000,
      },
      {
        id: 8,
        categoryName: "Pinturas e Acabamentos",
        contractorId: 6,
        contractorName: "Pinturas & Remodelações Beira",
        budgetedValue: 6000,
        contractedValue: 5900,
        executedValue: 1500,
        invoicedValue: 1000,
        paidValue: 1000,
      },
    ],
  },
  {
    id: 3,
    name: "Obra Santa Clara - Moradia",
    state: "Planeada",
    plannedStartDate: "2026-12-01",
    plannedEndDate: "2027-04-30",
    operationId: 102,
    operationCode: "OP-2026-003",
    operationName: "Santa Clara",
    notes: "Preparação de projeto e consulta ao mercado para adjudicação.",
    totalBudget: 25000,
    totalContracted: 24500,
    totalExecuted: 0,
    totalInvoiced: 0,
    totalPaid: 0,
    executedPercent: 0,
    budgetItems: [
      {
        id: 9,
        categoryName: "Demolições e Estrutura",
        contractorId: 2,
        contractorName: "Reabilita Coimbra, Unipessoal",
        budgetedValue: 14000,
        contractedValue: 13500,
        executedValue: 0,
        invoicedValue: 0,
        paidValue: 0,
      },
      {
        id: 10,
        categoryName: "Canalização e Climatização",
        contractorId: 4,
        contractorName: "Climatização do Centro",
        budgetedValue: 11000,
        contractedValue: 11000,
        executedValue: 0,
        invoicedValue: 0,
        paidValue: 0,
      },
    ],
  },
  {
    id: 4,
    name: "Obra Olivais - Remodelação T1",
    state: "Concluída",
    plannedStartDate: "2026-03-01",
    plannedEndDate: "2026-06-30",
    realStartDate: "2026-03-05",
    realEndDate: "2026-06-25",
    operationId: 103,
    operationCode: "OP-2025-014",
    operationName: "Olivais",
    notes: "Obra concluída com sucesso dentro do prazo e abaixo do orçamento previsto.",
    totalBudget: 17500,
    totalContracted: 17000,
    totalExecuted: 17000,
    totalInvoiced: 17000,
    totalPaid: 17000,
    executedPercent: 100,
    budgetItems: [
      {
        id: 11,
        categoryName: "Pinturas e Acabamentos",
        contractorId: 6,
        contractorName: "Pinturas & Remodelações Beira",
        budgetedValue: 8000,
        contractedValue: 7800,
        executedValue: 7800,
        invoicedValue: 7800,
        paidValue: 7800,
      },
      {
        id: 12,
        categoryName: "Carpintarias e Caixilharias",
        contractorId: 5,
        contractorName: "Carpintaria Moderna, Lda.",
        budgetedValue: 9500,
        contractedValue: 9200,
        executedValue: 9200,
        invoicedValue: 9200,
        paidValue: 9200,
      },
    ],
  },
];

