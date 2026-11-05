import { OPPORTUNITY_PHASES } from "../../lib/phases";
import { calcFinance } from "../../lib/finance";
import type { FinanceValues, OpportunityDetail, OpportunityOptions } from "../opportunitiesApi";

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
