import { calcFinance } from "../../lib/finance";
import { MONEY, TEXT_LIMITS, extraCostErrors, financeErrors, fitsRule, phaseNoteError, titleError } from "../../lib/opportunityRules";
import { LAST_OPPORTUNITY_PHASE, OPPORTUNITY_PHASES } from "../../lib/phases";
import { createOperationFromOpportunity } from "./operationsStore";
import { ApiError } from "../client";
import { getContact } from "../contactsApi";
import type { ExtraCost, FinanceValues, NewOpportunity, OpportunityCard, OpportunityChanges, OpportunityDetail } from "../opportunitiesApi";
import { currentUserFixture, defaultFinance, leads, opportunitiesFixture, opportunityOptionsFixture, propertiesFixture } from "../../temp";
import { respond } from "./respond";

// TODO: trocar pelo endpoint quando existir. Simula o servidor: as alterações ficam em memória até recarregar a página.

function find(id: number): OpportunityDetail {
  const opportunity = opportunitiesFixture.find((item) => item.id === id);
  if (!opportunity) throw new ApiError(404, "Oportunidade não encontrada");
  return opportunity;
}

/** Regista uma linha na atividade da oportunidade (também usado pelos documentos). */
export function recordActivity(id: number, text: string): void {
  const opportunity = opportunitiesFixture.find((item) => item.id === id);
  if (opportunity) record(opportunity, text);
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

/** Nome do contacto associado (contacto real em /api/contacts). Um id que não existe é recusado. */
async function contactName(contactId: number): Promise<string> {
  try {
    return (await getContact(contactId)).name;
  } catch {
    throw new ApiError(422, "Contacto inválido");
  }
}

/** O servidor valida sempre, mesmo que o formulário já o tenha feito. */
function validateOpportunity(input: OpportunityChanges): void {
  const invalid = titleError(input.title) ?? (!opportunityOptionsFixture.zones.includes(input.zone) ? "Zona inválida" : undefined);
  if (invalid) throw new ApiError(422, invalid);
  if (!fitsRule(input.askingPrice, MONEY) || input.askingPrice <= 0 || !fitsRule(input.vvr, MONEY) || input.vvr <= 0) throw new ApiError(422, "Valores inválidos");
}

export async function addOpportunity(input: NewOpportunity) {
  await respond(null);
  validateOpportunity(input);
  const property = input.propertyId === undefined ? undefined : propertiesFixture.find((item) => item.id === input.propertyId);
  if (input.propertyId !== undefined && !property) throw new ApiError(422, "Imóvel inválido");
  const id = Math.max(0, ...opportunitiesFixture.map((item) => item.id)) + 1;
  const sourceLead = leads.find((item) => item.id === input.leadId);
  if (input.leadId !== undefined && !sourceLead) throw new ApiError(422, "Lead de origem inválida");
  const lead = sourceLead && { id: sourceLead.id, name: sourceLead.contactName };
  const contact = input.contactId === undefined ? undefined : { id: input.contactId, name: await contactName(input.contactId) };
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
    contactName: contact?.name ?? lead?.name,
    contactId: contact?.id,
    updatedAt: now,
    property: property
      ? { id: property.id, code: property.code, areaM2: property.areaM2, visitDate: property.visitDate, notes: property.notes, constructionYear: property.constructionYear, condition: property.condition, energyCertificate: property.energyCertificate }
      : { code: `IM-${1100 + id}`, areaM2: 0 },
    finance,
    extraCosts: [],
    phaseHistory: [],
    activity: [{ date: now, text: lead ? `Oportunidade criada a partir da lead ${lead.name}` : property ? `Oportunidade criada a partir do imóvel ${property.code}` : "Oportunidade criada" }],
  };
  opportunitiesFixture.push(opportunity);
  return structuredClone(opportunity);
}

export async function updateOpportunity(id: number, changes: OpportunityChanges) {
  await respond(null);
  const opportunity = find(id);
  if (opportunity.rejection || opportunity.operationId) throw new ApiError(409, "Oportunidade fechada");
  validateOpportunity(changes);
  const name = changes.contactId === undefined ? undefined : await contactName(changes.contactId);
  const hadContact = opportunity.contactId !== undefined;
  Object.assign(opportunity, { ...changes, title: changes.title.trim() });
  if (name !== undefined) opportunity.contactName = name;
  else if (hadContact) opportunity.contactName = undefined;
  record(opportunity, "Dados da oportunidade atualizados");
  return structuredClone(opportunity);
}

export async function movePhase(id: number, phaseIndex: number, note: string) {
  await respond(null);
  const opportunity = find(id);
  const target = OPPORTUNITY_PHASES[phaseIndex];
  if (!target) throw new ApiError(422, "Fase inválida");
  if (phaseNoteError(note)) throw new ApiError(422, "Nota demasiado longa");
  opportunity.phaseHistory.unshift({
    from: OPPORTUNITY_PHASES[opportunity.phaseIndex].name,
    to: target.name,
    date: new Date().toISOString(),
    note: note.trim() || undefined,
  });
  opportunity.phaseIndex = phaseIndex;
  opportunity.daysInPhase = 0;
  record(opportunity, `Fase alterada para ${target.name}`);
  return structuredClone(opportunity);
}

export async function setPhaseNote(id: number, index: number, note: string) {
  await respond(null);
  const opportunity = find(id);
  const entry = opportunity.phaseHistory[index];
  if (!entry) throw new ApiError(404, "Linha do histórico não encontrada");
  if (phaseNoteError(note)) throw new ApiError(422, "Nota demasiado longa");
  entry.note = note.trim() || undefined;
  record(opportunity, `Nota do histórico de fases ${note.trim() ? "atualizada" : "removida"}`);
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
