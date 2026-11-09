// TODO(integração): TUDO o que está hard coded no frontend vive neste ficheiro.
// Ao integrar com o backend, remover este ficheiro e, em cada ficheiro que o importa
// (procurar por `temp"`), trocar o import por um hook/endpoint real.
// A lógica que simula o servidor está em api/fixtures/opportunitiesStore.ts (também a remover).

import { calcFinance } from "./lib/finance";
import { OPPORTUNITY_PHASES } from "./lib/phases";
import type { DashboardSummary } from "./api/dashboardApi";
import type { Contact, ContactOperation } from "./api/contactsApi";
import type { Lead, LeadContactEntry } from "./api/leadsApi";
import type { InvestorRecord } from "./api/investorsApi";
import type { FinanceValues, OpportunityDetail, OpportunityOptions } from "./api/opportunitiesApi";
import type { CurrentUser } from "./api/userApi";

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

// TODO: trocar pelo endpoint (zonas). Usada em leads, oportunidades, contactos e investidores.
export const zoneOptions = ["Baixa", "Alta", "Celas", "Solum", "Santa Clara", "Olivais"];

// TODO: trocar pelo endpoint (motivos de descarte).
export const discardReasonOptions = ["Sem interesse do proprietário", "Fora dos critérios de investimento", "Preço não negociável"];

// TODO: trocar pelo endpoint (canais de contacto).
export const contactChannelOptions = ["Telefone", "Email", "Reunião"];

// TODO: trocar pelo endpoint (tipologias).
export const typologyOptions = ["T0", "T1", "T2", "T3", "T4", "T5+"];

// TODO: trocar pelo endpoint (tipos de documento).
export const documentTypeOptions = ["Caderneta predial", "Certidão permanente", "Orçamento de obra", "Planta", "Licença de utilização", "Certificado energético", "Outro"];

// ---- Contactos ----

// Interruptor da API de contactos: true usa o Flask (/api/contacts, precisa do backend a correr e de
// sessão iniciada); false usa os dados de exemplo abaixo. Os componentes não mudam.
// TODO: pôr a true quando o backend correr em todos os PCs e depois apagar o interruptor.
export const USE_CONTACTS_API = false;

// TODO: trocar pelo endpoint (papéis em GET /api/contacts/roles). "Outro" = sem papel.
export const contactTypeOptions = ["Proprietário", "Empreiteiro", "Outro"];

// TODO: trocar pelo endpoint (canais de consentimento RGPD).
export const consentChannelOptions = ["Formulário do website", "Email", "Telefone", "Presencial"];

// TODO: trocar pelo endpoint quando existir. Pessoas fictícias. Os ids 5 a 8 são investidores (ver investorsFixture).
export const contactsFixture: Contact[] = [
  { id: 1, name: "Marta Ribeiro", roles: [], email: "marta.ribeiro@exemplo.pt", phone: "912 345 678", company: "Casa Certa", zone: "Baixa", nif: "247891320", address: "Rua Ferreira Borges, 54, Coimbra", notes: "Consultora imobiliária; traz oportunidades na Baixa.", consentGiven: true, consentDate: "2026-11-12T10:00:00.000Z", consentChannel: "Formulário do website" },
  { id: 2, name: "Miguel Seabra", roles: ["Empreiteiro"], email: "miguel.seabra@exemplo.pt", phone: "935 221 094", company: "Seabra Construções", zone: "Celas", nif: "218645902", address: "", notes: "", consentGiven: true, consentDate: "2026-11-18T09:30:00.000Z", consentChannel: "Email" },
  { id: 3, name: "Luís Paiva", roles: ["Proprietário"], email: "luis.paiva@exemplo.pt", phone: "966 018 443", company: "", zone: "Olivais", nif: "196287340", address: "Rua do Brasil, 120, Coimbra", notes: "", consentGiven: false, consentChannel: "" },
  { id: 4, name: "Inês Tavares", roles: [], email: "ines.tavares@exemplo.pt", phone: "918 476 220", company: "Tavares Arquitetura", zone: "Alta", nif: "257903615", address: "", notes: "Arquiteta; faz os projetos de licenciamento.", consentGiven: true, consentDate: "2026-11-04T15:00:00.000Z", consentChannel: "Presencial" },
  { id: 5, name: "Ana Lourenço", roles: ["Investidor"], email: "ana.lourenco@exemplo.pt", phone: "912 830 445", company: "", zone: "Alta", nif: "231456786", address: "", notes: "", consentGiven: true, consentDate: "2026-10-20T11:00:00.000Z", consentChannel: "Email" },
  { id: 6, name: "Manuel Gouveia", roles: ["Investidor"], email: "manuel.gouveia@exemplo.pt", phone: "934 112 887", company: "Gouveia Capital", zone: "Celas", nif: "209876549", address: "", notes: "", consentGiven: true, consentDate: "2026-10-02T11:00:00.000Z", consentChannel: "Presencial" },
  { id: 7, name: "Teresa Faria", roles: ["Investidor"], email: "teresa.faria@exemplo.pt", phone: "961 309 210", company: "", zone: "Baixa", nif: "277112230", address: "", notes: "", consentGiven: false, consentChannel: "" },
  { id: 8, name: "Pedro Alvim", roles: ["Investidor"], email: "pedro.alvim@exemplo.pt", phone: "922 874 601", company: "", zone: "Solum", nif: "266554431", address: "", notes: "", consentGiven: true, consentDate: "2026-09-15T11:00:00.000Z", consentChannel: "Telefone" },
  { id: 9, name: "Helena Antunes", roles: ["Proprietário"], email: "helena.antunes@exemplo.pt", phone: "917 552 908", company: "", zone: "Santa Clara", nif: "222334410", address: "Av. João das Regras, 15, Coimbra", notes: "", consentGiven: false, consentChannel: "" },
];

// TODO: trocar pelo endpoint quando existir (operações de um contacto).
export const contactOperationsFixture: Record<number, ContactOperation[]> = {
  2: [{ code: "OP-2026-001", role: "Empreiteiro", phase: "Em obra" }],
  3: [{ code: "OP-2025-014", role: "Proprietário (vendedor)", phase: "Vendido" }],
  5: [
    { code: "OP-2026-001", role: "Investidor", phase: "Em obra" },
    { code: "OP-2025-014", role: "Investidor", phase: "Vendido" },
  ],
  6: [{ code: "OP-2026-001", role: "Investidor", phase: "Em obra" }],
};

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

// TODO: trocar pelo endpoint quando existir. O id de cada investidor é o id do contacto (contactsFixture).
export const investorsFixture: InvestorRecord[] = [
  {
    id: 5, name: "Ana Lourenço", email: "ana.lourenco@exemplo.pt", phone: "912 830 445", company: "", zone: "Alta",
    profile: { availableCapital: 180000, riskProfile: "Moderado", preferredZones: ["Alta", "Baixa"], minAmount: 50000, maxAmount: 120000, preferredTerms: "8 a 18 meses, retorno mínimo de 8%", relationStatus: "Ativo" },
    investments: [
      { id: 1, operationCode: "OP-2026-001", committedValue: 80000, participationPercent: 46.4, returnType: "Juro fixo", returnRate: 8, agreementDate: "2026-11-08" },
      { id: 2, operationCode: "OP-2025-014", committedValue: 65000, participationPercent: 26.2, returnType: "Juro fixo", returnRate: 8, agreementDate: "2025-06-12" },
    ],
    documents: [
      { id: "inv-doc-1", name: "Contrato_investimento_OP001.pdf", type: "Contrato de investimento", propertyCode: "IM-1042", entity: "Investimento · OP-2026-001", sizeBytes: 1003520, status: "Válido" },
      { id: "inv-doc-2", name: "Contrato_investimento_OP014.pdf", type: "Contrato de investimento", propertyCode: "IM-0987", entity: "Investimento · OP-2025-014", sizeBytes: 954368, status: "Válido" },
    ],
  },
  {
    id: 6, name: "Manuel Gouveia", email: "manuel.gouveia@exemplo.pt", phone: "934 112 887", company: "Gouveia Capital", zone: "Celas",
    profile: { availableCapital: 250000, riskProfile: "Agressivo", preferredZones: ["Celas", "Solum"], minAmount: 40000, maxAmount: 150000, preferredTerms: "Até 24 meses", relationStatus: "Ativo" },
    investments: [{ id: 3, operationCode: "OP-2026-001", committedValue: 52000, participationPercent: 30.2, returnType: "Participação nos lucros", returnRate: 25, agreementDate: "2026-11-09" }],
    documents: [{ id: "inv-doc-3", name: "Acordo_participacao_OP001.pdf", type: "Contrato de investimento", propertyCode: "IM-1042", entity: "Investimento · OP-2026-001", sizeBytes: 870400, status: "Válido" }],
  },
  {
    id: 7, name: "Teresa Faria", email: "teresa.faria@exemplo.pt", phone: "961 309 210", company: "", zone: "Baixa",
    profile: { availableCapital: 95000, riskProfile: "Conservador", preferredZones: ["Baixa"], minAmount: 20000, maxAmount: 60000, preferredTerms: "Juro fixo, até 12 meses", relationStatus: "Prospeção" },
    investments: [],
    documents: [],
  },
  {
    id: 8, name: "Pedro Alvim", email: "pedro.alvim@exemplo.pt", phone: "922 874 601", company: "", zone: "Solum",
    profile: { availableCapital: 120000, riskProfile: "Moderado", preferredZones: ["Solum", "Santa Clara"], minAmount: 30000, maxAmount: 90000, preferredTerms: "", relationStatus: "Inativo" },
    investments: [],
    documents: [],
  },
];
