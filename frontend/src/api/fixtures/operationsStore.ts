import { cancellationReasonError, operationErrors } from "../../lib/operationRules";
import { OPERATION_PHASES, LAST_OPPORTUNITY_PHASE } from "../../lib/phases";
import { leadContactOptions, leads, opportunitiesFixture, operationsFixture, opportunityOptionsFixture } from "../../temp";
import { ApiError } from "../client";
import type { NewOperation, OperationCard, OperationDetail } from "../operationsApi";

const LATENCY_MS = 150;
let nextDocumentId = 1;

const respond = async <T,>(value: T): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  return structuredClone(value);
};

function find(id: number): OperationDetail {
  const operation = operationsFixture.find((item) => item.id === id);
  if (!operation) throw new ApiError(404, "Operação não encontrada");
  return operation;
}

function toCard(operation: OperationDetail): OperationCard {
  const { phaseHistory: _history, activity: _activity, documents: _documents, constructionWorks: _works, investments: _investments, ...card } = operation;
  return card;
}

function record(operation: OperationDetail, text: string) {
  const date = new Date().toISOString();
  operation.activity.unshift({ date, text });
}

function getNextCode(): string {
  const year = new Date().getFullYear();
  const highestSequence = operationsFixture.reduce((highest, item) => {
    const match = new RegExp(`^OP-${year}-(\\d+)$`).exec(item.code);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `OP-${year}-${String(highestSequence + 1).padStart(3, "0")}`;
}

function createFromOpportunity(opportunityId: number, values?: Pick<NewOperation, "buyerName" | "realPurchasePrice" | "advertisedPrice">): OperationDetail {
  const opportunity = opportunitiesFixture.find((item) => item.id === opportunityId);
  if (!opportunity) throw new ApiError(422, "Oportunidade de origem inválida");
  if (opportunity.phaseIndex !== LAST_OPPORTUNITY_PHASE) throw new ApiError(409, "Só uma oportunidade aprovada pode ser convertida");
  if (opportunity.operationId) {
    const existing = operationsFixture.find((item) => item.id === opportunity.operationId);
    if (existing) return existing;
  }

  const id = Math.max(0, ...operationsFixture.map((item) => item.id)) + 1;
  const realPurchasePrice = values?.realPurchasePrice ?? opportunity.askingPrice;
  const advertisedPrice = values?.advertisedPrice ?? opportunity.vvr;
  const date = new Date().toISOString();
  const operation: OperationDetail = {
    id,
    code: getNextCode(),
    title: opportunity.title,
    zone: opportunity.zone,
    typology: opportunity.typology,
    realPurchasePrice,
    advertisedPrice,
    expectedMargin: advertisedPrice - realPurchasePrice,
    phaseIndex: 0,
    daysInPhase: 0,
    owner: { name: opportunity.owner.name },
    propertyCode: opportunity.property.code,
    areaM2: opportunity.property.areaM2,
    opportunityId: opportunity.id,
    buyerName: values?.buyerName ?? opportunity.contactName ?? "",
    phaseHistory: [],
    activity: [{ date, text: `Operação criada a partir de ${opportunity.title}` }],
    documents: [],
    constructionWorks: [],
    investments: [],
  };
  opportunity.operationId = id;
  operationsFixture.push(operation);
  return operation;
}

export async function listOperations() {
  return respond(operationsFixture.filter((operation) => !operation.cancellation).map(toCard));
}

export async function findOperation(id: number) {
  await respond(null);
  return structuredClone(find(id));
}

export async function listOptions() {
  const approvedOpportunities = opportunitiesFixture
    .filter((opportunity) => opportunity.phaseIndex === LAST_OPPORTUNITY_PHASE && !opportunity.operationId && !opportunity.rejection)
    .map((opportunity) => ({
      id: opportunity.id,
      title: opportunity.title,
      zone: opportunity.zone,
      askingPrice: opportunity.askingPrice,
      vvr: opportunity.vvr,
      buyerName: opportunity.contactName ?? "",
    }));
  return respond({
    zones: opportunityOptionsFixture.zones,
    managers: opportunityOptionsFixture.managers,
    buyers: [...new Set([...leads.map((lead) => lead.contactName), ...leadContactOptions])],
    nextCode: getNextCode(),
    approvedOpportunities,
  });
}

export async function addOperation(input: NewOperation) {
  await respond(null);
  const errors = operationErrors(input);
  if (Object.keys(errors).length) throw new ApiError(422, Object.values(errors)[0] ?? "Dados inválidos");
  const opportunity = opportunitiesFixture.find((item) => item.id === input.opportunityId);
  if (!opportunity || opportunity.phaseIndex !== LAST_OPPORTUNITY_PHASE || opportunity.operationId) {
    throw new ApiError(409, "A oportunidade já não está disponível para converter");
  }
  if (!leads.some((lead) => lead.contactName === input.buyerName) && !leadContactOptions.includes(input.buyerName) && input.buyerName !== opportunity.contactName) {
    throw new ApiError(422, "Contacto comprador inválido");
  }
  return structuredClone(createFromOpportunity(input.opportunityId, input));
}

export async function createOperationFromOpportunity(opportunityId: number) {
  await respond(null);
  return structuredClone(createFromOpportunity(opportunityId));
}

export async function movePhase(id: number, phaseIndex: number) {
  await respond(null);
  const operation = find(id);
  const target = OPERATION_PHASES[phaseIndex];
  if (!target) throw new ApiError(422, "Fase inválida");
  operation.phaseHistory.unshift({
    from: OPERATION_PHASES[operation.phaseIndex].name,
    to: target.name,
    date: new Date().toISOString(),
  });
  operation.phaseIndex = phaseIndex;
  operation.daysInPhase = 0;
  record(operation, `Fase alterada para ${target.name}`);
  return structuredClone(operation);
}

export async function cancel(id: number, reason: string) {
  await respond(null);
  const operation = find(id);
  const error = cancellationReasonError(reason);
  if (error) throw new ApiError(422, error);
  operation.cancellation = { reason: reason.trim(), date: new Date().toISOString() };
  record(operation, `Operação cancelada: ${reason.trim()}`);
  return structuredClone(operation);
}

export async function addDocuments(id: number, files: File[], type: string) {
  await respond(null);
  const operation = find(id);
  for (const file of files) {
    operation.documents.push({
      id: `operation-upload-${nextDocumentId++}`,
      name: file.name,
      type,
      propertyCode: operation.propertyCode,
      entity: operation.code,
      sizeBytes: file.size,
      status: "Válido",
    });
  }
  record(operation, files.length === 1 ? "Documento carregado" : `${files.length} documentos carregados`);
  return structuredClone(operation);
}

export { createFromOpportunity };
