import { calcFinance } from "../../lib/finance";
import { MONEY, TEXT_LIMITS, extraCostErrors, financeErrors, fitsRule, titleError } from "../../lib/opportunityRules";
import { LAST_OPPORTUNITY_PHASE, OPPORTUNITY_PHASES } from "../../lib/phases";
import { createOperationFromOpportunity } from "./operationsStore";
import { ApiError } from "../client";
import type { ExtraCost, FinanceValues, NewOpportunity, OpportunityCard, OpportunityDetail } from "../opportunitiesApi";
import { currentUserFixture, defaultFinance, leads, opportunitiesFixture, opportunityOptionsFixture } from "../../temp";

// TODO: trocar pelo endpoint quando existir. Simula o servidor: as alterações ficam em memória até recarregar a página.

const LATENCY_MS = 150;
let nextDocumentId = 1;

const respond = async <T,>(value: T): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  return structuredClone(value);
};

function find(id: number): OpportunityDetail {
  const opportunity = opportunitiesFixture.find((item) => item.id === id);
  if (!opportunity) throw new ApiError(404, "Oportunidade não encontrada");
  return opportunity;
}

function record(opportunity: OpportunityDetail, text: string): void {
  const date = new Date().toISOString();
  opportunity.updatedAt = date;
  opportunity.activity.unshift({ date, text });
}

function toCard({ id, title, zone, typology, askingPrice, vvr, estimatedProfit, phaseIndex, daysInPhase, owner }: OpportunityDetail): OpportunityCard {
  return { id, title, zone, typology, askingPrice, vvr, estimatedProfit, phaseIndex, daysInPhase, owner };
}

export function listOpportunities() {
  return respond(opportunitiesFixture.filter((item) => !item.rejection && !item.operationId).map(toCard));
}

export async function findOpportunity(id: number) {
  await respond(null);
  return structuredClone(find(id));
}

export function listOptions() {
  return respond(opportunityOptionsFixture);
}

export async function addOpportunity(input: NewOpportunity) {
  await respond(null);
  // O servidor valida sempre, mesmo que o formulário já o tenha feito.
  const invalid = titleError(input.title) ?? (!opportunityOptionsFixture.zones.includes(input.zone) ? "Zona inválida" : undefined);
  if (invalid) throw new ApiError(422, invalid);
  if (!fitsRule(input.askingPrice, MONEY) || input.askingPrice <= 0 || !fitsRule(input.vvr, MONEY) || input.vvr <= 0) throw new ApiError(422, "Valores inválidos");
  const id = Math.max(0, ...opportunitiesFixture.map((item) => item.id)) + 1;
  const sourceLead = leads.find((item) => item.id === input.leadId);
  if (input.leadId !== undefined && !sourceLead) throw new ApiError(422, "Lead de origem inválida");
  const lead = sourceLead && { id: sourceLead.id, name: sourceLead.contactName };
  const finance = defaultFinance(input.askingPrice, input.vvr);
  const now = new Date().toISOString();
  const opportunity: OpportunityDetail = {
    id,
    title: input.title.trim(),
    zone: input.zone,
    typology: input.typology,
    askingPrice: input.askingPrice,
    vvr: input.vvr,
    estimatedProfit: calcFinance(finance, []).margin,
    phaseIndex: 0,
    daysInPhase: 0,
    owner: { name: currentUserFixture.name },
    contactName: lead?.name,
    updatedAt: now,
    property: { code: `IM-${1100 + id}`, areaM2: 0 },
    finance,
    extraCosts: [],
    phaseHistory: [],
    activity: [{ date: now, text: lead ? `Oportunidade criada a partir da lead ${lead.name}` : "Oportunidade criada" }],
    documents: [],
  };
  opportunitiesFixture.push(opportunity);
  return structuredClone(opportunity);
}

export async function movePhase(id: number, phaseIndex: number) {
  await respond(null);
  const opportunity = find(id);
  const target = OPPORTUNITY_PHASES[phaseIndex];
  if (!target) throw new ApiError(422, "Fase inválida");
  opportunity.phaseHistory.unshift({
    from: OPPORTUNITY_PHASES[opportunity.phaseIndex].name,
    to: target.name,
    date: new Date().toISOString(),
  });
  opportunity.phaseIndex = phaseIndex;
  opportunity.daysInPhase = 0;
  record(opportunity, `Fase alterada para ${target.name}`);
  return structuredClone(opportunity);
}

export async function saveFinance(id: number, finance: FinanceValues, extraCosts: ExtraCost[]) {
  await respond(null);
  const opportunity = find(id);
  if (Object.keys(financeErrors(finance)).length || Object.keys(extraCostErrors(extraCosts)).length) throw new ApiError(422, "Análise financeira inválida");
  opportunity.finance = structuredClone(finance);
  opportunity.extraCosts = structuredClone(extraCosts);
  opportunity.estimatedProfit = calcFinance(finance, extraCosts).margin;
  record(opportunity, "Análise financeira atualizada");
  return structuredClone(opportunity);
}

export async function addDocuments(id: number, files: File[], type: string) {
  await respond(null);
  const opportunity = find(id);
  for (const file of files) {
    opportunity.documents.push({
      id: `upload-${nextDocumentId++}`,
      name: file.name,
      type,
      propertyCode: opportunity.property.code,
      entity: `Oportunidade · ${opportunity.title}`,
      sizeBytes: file.size,
      status: "Válido",
    });
  }
  record(opportunity, files.length === 1 ? "Documento carregado" : `${files.length} documentos carregados`);
  return structuredClone(opportunity);
}

export async function reject(id: number, reason: string) {
  await respond(null);
  const opportunity = find(id);
  if (!reason.trim() || reason.length > TEXT_LIMITS.rejectionReason) throw new ApiError(422, "Motivo inválido");
  opportunity.rejection = { reason, date: new Date().toISOString() };
  record(opportunity, `Marcada como rejeitada/perdida: ${reason}`);
  return structuredClone(opportunity);
}

export async function convert(id: number) {
  await respond(null);
  const opportunity = find(id);
  if (opportunity.phaseIndex !== LAST_OPPORTUNITY_PHASE) throw new ApiError(409, "Só uma oportunidade aprovada pode ser convertida");
  const operation = await createOperationFromOpportunity(id);
  record(opportunity, "Convertida em operação");
  return { operationId: operation.id };
}
