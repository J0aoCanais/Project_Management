import { budgetItemErrors, workFormErrors, type PhotoStage } from "../../lib/workRules";
import { workOptionsFixture, worksFixture } from "../../temp";
import { ApiError } from "../client";
import type {
  BudgetItem,
  NewWorkInput,
  UpdateWorkInput,
  WorkCard,
  WorkDetail,
  WorkDocument,
  WorkFilterParams,
  WorkStatsSummary,
} from "../worksApi";

const LATENCY_MS = 150;
let nextDocumentId = 100;
let nextBudgetId = 100;

const respond = async <T,>(value: T): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  return structuredClone(value);
};

function recalculateTotals(work: WorkDetail): void {
  const items = work.budgetItems;
  work.totalBudget = items.reduce((sum, item) => sum + (item.budgetedValue || 0), 0);
  work.totalContracted = items.reduce((sum, item) => sum + (item.contractedValue || 0), 0);
  work.totalExecuted = items.reduce((sum, item) => sum + (item.executedValue || 0), 0);
  work.totalInvoiced = items.reduce((sum, item) => sum + (item.invoicedValue || 0), 0);
  work.totalPaid = items.reduce((sum, item) => sum + (item.paidValue || 0), 0);

  const base = work.totalContracted > 0 ? work.totalContracted : work.totalBudget;
  work.executedPercent = base > 0 ? Math.min(100, Math.round((work.totalExecuted / base) * 1000) / 10) : 0;
}

function find(id: number): WorkDetail {
  const work = worksFixture.find((item) => item.id === id);
  if (!work) throw new ApiError(404, "Obra não encontrada");
  recalculateTotals(work);
  return work;
}

function toCard(work: WorkDetail): WorkCard {
  recalculateTotals(work);
  return {
    id: work.id,
    name: work.name,
    state: work.state,
    plannedStartDate: work.plannedStartDate,
    plannedEndDate: work.plannedEndDate,
    realStartDate: work.realStartDate,
    realEndDate: work.realEndDate,
    operationId: work.operationId,
    operationCode: work.operationCode,
    operationName: work.operationName,
    totalBudget: work.totalBudget,
    totalContracted: work.totalContracted,
    totalExecuted: work.totalExecuted,
    totalInvoiced: work.totalInvoiced,
    totalPaid: work.totalPaid,
    executedPercent: work.executedPercent,
  };
}

export async function listWorks(filters?: WorkFilterParams): Promise<WorkCard[]> {
  await respond(null);

  let result = [...worksFixture];

  if (filters?.query) {
    const q = filters.query.toLowerCase().trim();
    result = result.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.operationCode.toLowerCase().includes(q) ||
        w.operationName.toLowerCase().includes(q),
    );
  }

  if (filters?.state) {
    result = result.filter((w) => w.state === filters.state);
  }

  if (filters?.operation) {
    const op = filters.operation.toLowerCase().trim();
    result = result.filter(
      (w) =>
        String(w.operationId) === filters.operation ||
        w.operationCode.toLowerCase() === op ||
        w.operationName.toLowerCase() === op,
    );
  }

  return result.map(toCard);
}

export async function findWork(id: number): Promise<WorkDetail> {
  await respond(null);
  return structuredClone(find(id));
}

export async function getStats(): Promise<WorkStatsSummary> {
  await respond(null);

  const works = worksFixture;
  works.forEach(recalculateTotals);

  const activeCount = works.filter((w) => w.state === "Em curso" || w.state === "Atrasada").length;
  const totalBudget = works.reduce((sum, w) => sum + w.totalBudget, 0);
  const totalExecuted = works.reduce((sum, w) => sum + w.totalExecuted, 0);
  const totalPaid = works.reduce((sum, w) => sum + w.totalPaid, 0);
  const executedPercent = totalBudget > 0 ? Math.round((totalExecuted / totalBudget) * 1000) / 10 : 0;

  return {
    activeCount,
    totalBudget,
    executedPercent,
    totalPaid,
  };
}

export function listOptions() {
  return respond(workOptionsFixture);
}

export async function addWork(input: NewWorkInput): Promise<WorkDetail> {
  await respond(null);

  const errors = workFormErrors({
    name: input.name,
    operationId: input.operationId,
    plannedStartDate: input.plannedStartDate,
    plannedEndDate: input.plannedEndDate,
    notes: input.notes,
  });

  if (Object.keys(errors).length > 0) {
    throw new ApiError(422, Object.values(errors)[0]);
  }

  const op = workOptionsFixture.operations.find((o) => o.id === Number(input.operationId));
  if (!op) {
    throw new ApiError(422, "Operação inválida");
  }

  const id = Math.max(0, ...worksFixture.map((w) => w.id)) + 1;
  const newWork: WorkDetail = {
    id,
    name: input.name.trim(),
    state: input.state ?? "Planeada",
    plannedStartDate: input.plannedStartDate || undefined,
    plannedEndDate: input.plannedEndDate || undefined,
    operationId: op.id,
    operationCode: op.code,
    operationName: op.name.includes("·") ? op.name.split("·")[1].trim() : op.name,
    notes: input.notes?.trim() || undefined,
    totalBudget: 0,
    totalContracted: 0,
    totalExecuted: 0,
    totalInvoiced: 0,
    totalPaid: 0,
    executedPercent: 0,
    budgetItems: [],
    documents: [],
  };

  worksFixture.unshift(newWork);
  return structuredClone(newWork);
}

export async function updateWork(id: number, input: UpdateWorkInput): Promise<WorkDetail> {
  await respond(null);
  const work = find(id);

  const errors = workFormErrors({
    name: input.name ?? work.name,
    operationId: input.operationId ?? work.operationId,
    plannedStartDate: input.plannedStartDate ?? work.plannedStartDate,
    plannedEndDate: input.plannedEndDate ?? work.plannedEndDate,
    realStartDate: input.realStartDate ?? work.realStartDate,
    realEndDate: input.realEndDate ?? work.realEndDate,
    notes: input.notes ?? work.notes,
  });

  if (Object.keys(errors).length > 0) {
    throw new ApiError(422, Object.values(errors)[0]);
  }

  if (input.operationId !== undefined) {
    const op = workOptionsFixture.operations.find((o) => o.id === Number(input.operationId));
    if (!op) throw new ApiError(422, "Operação inválida");
    work.operationId = op.id;
    work.operationCode = op.code;
    work.operationName = op.name.includes("·") ? op.name.split("·")[1].trim() : op.name;
  }

  if (input.name !== undefined) work.name = input.name.trim();
  if (input.state !== undefined) work.state = input.state;
  if (input.plannedStartDate !== undefined) work.plannedStartDate = input.plannedStartDate || undefined;
  if (input.plannedEndDate !== undefined) work.plannedEndDate = input.plannedEndDate || undefined;
  if (input.realStartDate !== undefined) work.realStartDate = input.realStartDate || undefined;
  if (input.realEndDate !== undefined) work.realEndDate = input.realEndDate || undefined;
  if (input.notes !== undefined) work.notes = input.notes.trim() || undefined;

  recalculateTotals(work);
  return structuredClone(work);
}

export async function markCompleted(id: number): Promise<WorkDetail> {
  await respond(null);
  const work = find(id);

  work.state = "Concluída";
  if (!work.realEndDate) {
    work.realEndDate = new Date().toISOString().slice(0, 10);
  }
  if (!work.realStartDate && work.plannedStartDate) {
    work.realStartDate = work.plannedStartDate;
  }

  recalculateTotals(work);
  return structuredClone(work);
}

export async function saveBudgetItem(
  workId: number,
  item: Omit<BudgetItem, "id"> & { id?: string },
): Promise<WorkDetail> {
  await respond(null);
  const work = find(workId);

  const errors = budgetItemErrors({
    categoryName: item.categoryName,
    contractorName: item.contractorName,
    budgetedValue: item.budgetedValue,
    contractedValue: item.contractedValue,
    executedValue: item.executedValue,
    invoicedValue: item.invoicedValue,
    paidValue: item.paidValue,
  });

  if (Object.keys(errors).length > 0) {
    throw new ApiError(422, Object.values(errors)[0]);
  }

  if (item.id) {
    const existingIndex = work.budgetItems.findIndex((b) => b.id === item.id);
    if (existingIndex >= 0) {
      work.budgetItems[existingIndex] = {
        ...work.budgetItems[existingIndex],
        ...item,
        id: item.id,
      };
    } else {
      work.budgetItems.push({
        ...item,
        id: item.id,
      });
    }
  } else {
    const newId = `b-${nextBudgetId++}`;
    work.budgetItems.push({
      ...item,
      id: newId,
    });
  }

  recalculateTotals(work);
  return structuredClone(work);
}

export async function deleteBudgetItem(workId: number, itemId: string): Promise<WorkDetail> {
  await respond(null);
  const work = find(workId);

  work.budgetItems = work.budgetItems.filter((b) => b.id !== itemId);
  recalculateTotals(work);
  return structuredClone(work);
}

export async function addDocuments(
  workId: number,
  files: File[],
  type: string,
  photoStage?: PhotoStage,
): Promise<WorkDetail> {
  await respond(null);
  const work = find(workId);

  for (const file of files) {
    const doc: WorkDocument = {
      id: `doc-w-${nextDocumentId++}`,
      name: file.name,
      type,
      sizeBytes: file.size,
      entity: `Obra · ${work.name}`,
      status: "Válido",
      photoStage: type === "Fotografia de obra" ? photoStage : undefined,
      createdAt: new Date().toISOString(),
    };
    work.documents.push(doc);
  }

  return structuredClone(work);
}
