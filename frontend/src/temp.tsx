// TODO(integração): TUDO o que está hard coded no frontend vive neste ficheiro.
// Ao integrar com o backend, remover este ficheiro e, em cada ficheiro que o importa
// (procurar por `temp"`), trocar o import por um hook/endpoint real.
// A lógica que simula o servidor está em api/fixtures/opportunitiesStore.ts (também a remover).

import { calcFinance } from "./lib/finance";
import { OPPORTUNITY_PHASES } from "./lib/phases";
import type { DashboardSummary } from "./api/dashboardApi";
import type { Lead, LeadContactEntry } from "./api/leadsApi";
import type { FinanceValues, OpportunityDetail, OpportunityOptions } from "./api/opportunitiesApi";
import type { CurrentUser } from "./api/userApi";
import type { WorkDetail, WorkOptions } from "./api/worksApi";
import { BUDGET_CATEGORIES, PHOTO_STAGES, WORK_DOCUMENT_TYPES, WORK_STATES } from "./lib/workRules";

// ---- Utilizador autenticado ----

// TODO: trocar pelo endpoint quando existir (utilizador autenticado).
export const currentUserFixture: CurrentUser = {
  id: 1,
  name: "Rodrigo Mendes",
  role: "Administrador",
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

// ---- Obras ----

// TODO: trocar pelo endpoint quando existir.
export const workOperationOptions = [
  { id: 1, code: "OP-2026-001", name: "OP-2026-001 · Baixa de Coimbra" },
  { id: 2, code: "OP-2026-002", name: "OP-2026-002 · Solum" },
  { id: 3, code: "OP-2026-003", name: "OP-2026-003 · Santa Clara" },
  { id: 4, code: "OP-2025-014", name: "OP-2025-014 · Olivais" },
];

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
    operationId: 1,
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
        id: "b-1",
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
        id: "b-2",
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
        id: "b-3",
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
        id: "b-4",
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
        id: "b-5",
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
    documents: [
      {
        id: "doc-w-1",
        name: "Caderno_Encargos_Obra_Baixa.pdf",
        type: "Orçamento de obra",
        entity: "Obra · Obra Baixa",
        propertyCode: "IM-1042",
        sizeBytes: 1420000,
        status: "Válido",
      },
      {
        id: "doc-w-2",
        name: "Planta_Intervencao_Baixa.pdf",
        type: "Planta",
        entity: "Obra · Obra Baixa",
        propertyCode: "IM-1042",
        sizeBytes: 2840000,
        status: "Válido",
      },
      {
        id: "doc-w-3",
        name: "Licenca_Camara_Obras_Baixa.pdf",
        type: "Licença",
        entity: "Obra · Obra Baixa",
        propertyCode: "IM-1042",
        sizeBytes: 920000,
        validUntil: "2027-01-30",
        status: "Válido",
      },
      {
        id: "doc-w-4",
        name: "Sala_Antes_Demolicao.jpg",
        type: "Fotografia de obra",
        photoStage: "Antes",
        entity: "Obra · Obra Baixa",
        propertyCode: "IM-1042",
        sizeBytes: 3400000,
        status: "Válido",
      },
      {
        id: "doc-w-5",
        name: "Reforco_Estrutural_Cozinha.jpg",
        type: "Fotografia de obra",
        photoStage: "Durante",
        entity: "Obra · Obra Baixa",
        propertyCode: "IM-1042",
        sizeBytes: 2900000,
        status: "Válido",
      },
      {
        id: "doc-w-6",
        name: "Fatura_Adiantamento_Silva.pdf",
        type: "Fatura",
        entity: "Obra · Obra Baixa",
        propertyCode: "IM-1042",
        sizeBytes: 310000,
        status: "Válido",
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
    operationId: 2,
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
        id: "b-6",
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
        id: "b-7",
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
        id: "b-8",
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
    documents: [
      {
        id: "doc-w-7",
        name: "Orcamento_Geral_Solum.xlsx",
        type: "Orçamento de obra",
        entity: "Obra · Obra Solum - Renovações",
        propertyCode: "IM-1018",
        sizeBytes: 450000,
        status: "Válido",
      },
      {
        id: "doc-w-8",
        name: "Foto_Frente_Inicio.jpg",
        type: "Fotografia de obra",
        photoStage: "Antes",
        entity: "Obra · Obra Solum - Renovações",
        propertyCode: "IM-1018",
        sizeBytes: 2200000,
        status: "Válido",
      },
    ],
  },
  {
    id: 3,
    name: "Obra Santa Clara - Moradia",
    state: "Planeada",
    plannedStartDate: "2026-12-01",
    plannedEndDate: "2027-04-30",
    operationId: 3,
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
        id: "b-9",
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
        id: "b-10",
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
    documents: [
      {
        id: "doc-w-9",
        name: "Projeto_Arquitetura_SantaClara.pdf",
        type: "Planta",
        entity: "Obra · Obra Santa Clara - Moradia",
        sizeBytes: 5600000,
        status: "Válido",
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
    operationId: 4,
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
        id: "b-11",
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
        id: "b-12",
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
    documents: [
      {
        id: "doc-w-10",
        name: "Auto_Recepcao_Obra_Olivais.pdf",
        type: "Outro",
        entity: "Obra · Obra Olivais - Remodelação T1",
        sizeBytes: 620000,
        status: "Válido",
      },
      {
        id: "doc-w-11",
        name: "Sala_Final.jpg",
        type: "Fotografia de obra",
        photoStage: "Depois",
        entity: "Obra · Obra Olivais - Remodelação T1",
        sizeBytes: 3100000,
        status: "Válido",
      },
    ],
  },
];

