// TODO(integração): TUDO o que está hard coded no frontend vive neste ficheiro.
// Ao integrar com o backend, remover este ficheiro e, em cada ficheiro que o importa
// (procurar por `temp"`), trocar o import por um hook/endpoint real.
// A lógica que simula o servidor está em api/fixtures/*Store.ts (também a remover).

import { calcFinance } from "./lib/finance";
import { OPPORTUNITY_PHASES } from "./lib/phases";
import type { DashboardSummary } from "./api/dashboardApi";
import type { DocumentOwner, DocumentOwnerKind, DocumentRecord } from "./api/documentsApi";
import type { BudgetItemRef, MovementCategory, MovementInput } from "./api/financeApi";
import type { PropertyDetail } from "./api/propertiesApi";
import type { Lead, LeadContactEntry } from "./api/leadsApi";
import type { FinanceValues, OpportunityDetail, OpportunityOptions } from "./api/opportunitiesApi";
import type { CurrentUser } from "./api/userApi";

// TODO: trocar pelo endpoint (zonas). Usado por leads, oportunidades e imóveis.
export const zoneOptions = ["Baixa", "Alta", "Celas", "Solum", "Santa Clara", "Olivais"];

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

// TODO: trocar pelo endpoint (zonas).
export const leadZoneOptions = zoneOptions;

// TODO: trocar pelo endpoint (motivos de descarte).
export const discardReasonOptions = ["Sem interesse do proprietário", "Fora dos critérios de investimento", "Preço não negociável"];

// TODO: trocar pelo endpoint (canais de contacto).
export const contactChannelOptions = ["Telefone", "Email", "Reunião"];

// TODO: trocar pelo endpoint (tipologias).
export const typologyOptions = ["T0", "T1", "T2", "T3", "T4", "T5+"];


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
  { id: 1050, code: "IM-1050", address: "Rua Ferreira Borges, 45, Coimbra", zone: "Baixa", typology: "T3", propertyType: "Apartamento", areaM2: 98, askingPrice: 172400, vvr: 239000, visitDate: dayFromToday(-70), constructionYear: 1940, condition: "Em obra" },
  { id: 1060, code: "IM-1060", address: "Rua António Augusto Gonçalves, 9, Coimbra", zone: "Santa Clara", typology: "T2", propertyType: "Apartamento", areaM2: 80, askingPrice: 160000, vvr: 342800, constructionYear: 1990, condition: "Renovado", energyCertificate: "B" },
  { id: 1012, code: "IM-1012", address: "Rua Dom João III, 21, Coimbra", zone: "Olivais", typology: "T2", propertyType: "Apartamento", areaM2: 75, askingPrice: 150000, vvr: 248000, constructionYear: 1980, condition: "Renovado" },
];

// ---- Operações, obras e investimentos (só o que as outras páginas precisam para ligar registos) ----

// TODO: trocar pelos endpoints das operações, obras e investimentos (tarefas 04, 05 e 06).
export const operationRefs = [
  { id: 1, code: "OP-2026-001", zone: "Baixa", phase: "Em obra", propertyId: 1050 },
  { id: 2, code: "OP-2026-002", zone: "Solum", phase: "Em aquisição", propertyId: 1018 },
  { id: 3, code: "OP-2026-003", zone: "Santa Clara", phase: "À venda", propertyId: 1060 },
  { id: 4, code: "OP-2025-014", zone: "Olivais", phase: "Vendido", propertyId: 1012 },
];

export const workRefs = [{ id: 1, label: "Obra OP-2026-001 · Baixa", operationId: 1 }];

export const investmentRefs = [
  { id: 1, label: "Ana Lourenço · OP-2026-001", investorId: 1 },
  { id: 2, label: "Manuel Gouveia · OP-2026-002", investorId: 2 },
];

export const budgetItemsFixture: Omit<BudgetItemRef, "used">[] = [
  { id: 1, label: "Eletricidade · Obra OP-2026-001", workId: 1, contracted: 24000 },
  { id: 2, label: "Canalização · Obra OP-2026-001", workId: 1, contracted: 9500 },
  { id: 3, label: "Cozinha · Obra OP-2026-001", workId: 1, contracted: 14000 },
];

// ---- Finanças ----

// TODO: trocar pelo endpoint (categorias de movimento, geridas em Definições — tarefa 05).
export const movementCategoriesFixture: MovementCategory[] = [
  { id: 1, name: "Aquisição", direction: "Saída" },
  { id: 2, name: "Impostos", direction: "Saída" },
  { id: 3, name: "Obras", direction: "Saída" },
  { id: 4, name: "Custo de estrutura", direction: "Saída" },
  { id: 5, name: "Juros", direction: "Saída" },
  { id: 6, name: "Comissões", direction: "Saída" },
  { id: 7, name: "Investimento", direction: "Entrada" },
  { id: 8, name: "Venda", direction: "Entrada" },
  { id: 9, name: "Financiamento bancário", direction: "Entrada" },
];

// TODO: trocar pelo endpoint quando existir.
export const financingsFixture = [
  { id: 1, name: "Crédito bancário · OP-2026-001", amount: 120000 },
  { id: 2, name: "Linha de tesouraria", amount: 30000 },
];

// TODO: trocar pelo endpoint quando existir. O estado é calculado pelo servidor simulado a partir das datas.
export const movementsFixture: (MovementInput & { id: number })[] = [
  { id: 1, categoryId: 3, amount: 12500, expectedDate: dayFromToday(2), link: { kind: "budgetItem", id: 1 }, notes: "Adiantamento ao empreiteiro (eletricidade)" },
  { id: 2, categoryId: 7, amount: 45000, expectedDate: dayFromToday(-4), effectiveDate: dayFromToday(-4), link: { kind: "investment", id: 2 }, notes: "Tranche do investidor" },
  { id: 3, categoryId: 4, amount: 390, expectedDate: dayFromToday(-8), effectiveDate: dayFromToday(-8), notes: "Software de gestão" },
  { id: 4, categoryId: 8, amount: 24800, expectedDate: dayFromToday(4), link: { kind: "operation", id: 4 }, notes: "Sinal do CPCV de venda" },
  { id: 5, categoryId: 1, amount: 172400, expectedDate: dayFromToday(-40), effectiveDate: dayFromToday(-38), link: { kind: "operation", id: 1 }, notes: "Escritura de compra" },
  { id: 6, categoryId: 2, amount: 8400, expectedDate: dayFromToday(-40), effectiveDate: dayFromToday(-40), link: { kind: "operation", id: 1 }, notes: "IMT" },
  { id: 7, categoryId: 3, amount: 5000, expectedDate: dayFromToday(-6), link: { kind: "budgetItem", id: 2 }, notes: "Primeira fatura da canalização" },
  { id: 8, categoryId: 9, amount: 90000, expectedDate: dayFromToday(-36), effectiveDate: dayFromToday(-35), link: { kind: "financing", id: 1 }, notes: "Desembolso do crédito" },
  { id: 9, categoryId: 5, amount: 650, expectedDate: dayFromToday(-5), effectiveDate: dayFromToday(-5), link: { kind: "financing", id: 1 } },
  { id: 10, categoryId: 3, amount: 6000, expectedDate: dayFromToday(-20), effectiveDate: dayFromToday(-21), link: { kind: "budgetItem", id: 1 }, notes: "Sinal ao empreiteiro (eletricidade)" },
  { id: 11, categoryId: 7, amount: 80000, expectedDate: dayFromToday(-60), effectiveDate: dayFromToday(-60), link: { kind: "investment", id: 1 }, notes: "Capital comprometido" },
  { id: 12, categoryId: 8, amount: 248000, expectedDate: dayFromToday(25), link: { kind: "operation", id: 4 }, notes: "Escritura de venda" },
  { id: 13, categoryId: 6, amount: 12400, expectedDate: dayFromToday(25), link: { kind: "operation", id: 4 }, notes: "Comissão da agência" },
];

// ---- Documentos ----

// TODO: trocar pelo endpoint (tipos de documento por entidade).
export const documentTypesByOwner: Record<DocumentOwnerKind, string[]> = {
  opportunity: ["Caderneta predial", "Certidão permanente", "Orçamento de obra", "Planta", "Licença de utilização", "Certificado energético", "Outro"],
  property: ["Caderneta predial", "Certidão permanente", "Licença de utilização", "Certificado energético", "Planta", "Outro"],
  operation: ["CPCV", "Escritura", "Contrato", "Certidão permanente", "Outro"],
  work: ["Orçamento de obra", "Contrato de empreitada", "Licença de obra", "Outro"],
  investment: ["Contrato", "Comprovativo de transferência", "Outro"],
  movement: ["Fatura", "Recibo", "Comprovativo de pagamento", "Outro"],
};

// TODO: trocar pelo endpoint (documentos obrigatórios por entidade, geridos em Definições).
export const requiredDocumentTypes: Partial<Record<DocumentOwnerKind, string[]>> = {
  property: ["Caderneta predial", "Certidão permanente", "Certificado energético"],
};

function documentFixture(id: number, name: string, type: string, owner: DocumentOwner, sizeBytes: number, uploadedDaysAgo: number, expiryOffset?: number): Omit<DocumentRecord, "owner"> & { owner: DocumentOwner } {
  return {
    id,
    name,
    type,
    fileType: (name.split(".").pop() ?? "").toUpperCase(),
    sizeBytes,
    fileHash: `sha256-exemplo-${id.toString(16).padStart(8, "0")}`,
    uploadedAt: daysAgo(uploadedDaysAgo),
    expiryDate: expiryOffset === undefined ? undefined : dayFromToday(expiryOffset),
    owner,
  };
}

// TODO: trocar pelo endpoint quando existir. O nome do dono é resolvido pelo servidor simulado.
export const documentsFixture = [
  documentFixture(1, "CPCV_compra_OP001.pdf", "CPCV", { kind: "operation", id: 1 }, 1887437, 45),
  documentFixture(2, "Certidão_permanente_IM1042.pdf", "Certidão permanente", { kind: "property", id: 1042 }, 860160, 9, 6),
  documentFixture(3, "Caderneta_predial_IM1042.pdf", "Caderneta predial", { kind: "property", id: 1042 }, 419840, 9),
  documentFixture(4, "Orçamento_eletricidade.xlsx", "Orçamento de obra", { kind: "work", id: 1 }, 229376, 25),
  documentFixture(5, "Planta_IM1042.pdf", "Planta", { kind: "opportunity", id: 3 }, 1258291, 6),
  documentFixture(6, "Relatório_visita_Baixa.pdf", "Outro", { kind: "opportunity", id: 3 }, 342016, 2),
  documentFixture(7, "Contrato_investimento_AL.pdf", "Contrato", { kind: "investment", id: 1 }, 1003520, 60),
  documentFixture(8, "Fatura_sinal_eletricidade.pdf", "Fatura", { kind: "movement", id: 10 }, 188416, 21),
  documentFixture(9, "Certificado_energético_IM1018.pdf", "Certificado energético", { kind: "property", id: 1018 }, 655360, 400, -10),
  documentFixture(10, "Escritura_compra_OP001.pdf", "Escritura", { kind: "operation", id: 1 }, 2516582, 38),
  documentFixture(11, "Licença_utilização_IM1050.pdf", "Licença de utilização", { kind: "property", id: 1050 }, 512000, 80, 400),
];
