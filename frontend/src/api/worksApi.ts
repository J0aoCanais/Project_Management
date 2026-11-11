import * as store from "./fixtures/worksStore";
import type { PhotoStage, WorkState } from "../lib/workRules";

export interface BudgetItem {
  id: string;
  categoryName: string;
  contractorId?: number;
  contractorName: string;
  budgetedValue: number;
  contractedValue: number;
  executedValue: number;
  invoicedValue: number;
  paidValue: number;
}

export interface WorkDocument {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  entity: string;
  propertyCode?: string;
  validUntil?: string;
  status: string;
  photoStage?: PhotoStage;
  createdAt?: string;
}

export interface WorkCard {
  id: number;
  name: string;
  state: WorkState;
  plannedStartDate?: string;
  plannedEndDate?: string;
  realStartDate?: string;
  realEndDate?: string;
  operationId: number;
  operationCode: string;
  operationName: string;
  totalBudget: number;
  totalContracted: number;
  totalExecuted: number;
  totalInvoiced: number;
  totalPaid: number;
  executedPercent: number;
}

export interface WorkDetail extends WorkCard {
  notes?: string;
  budgetItems: BudgetItem[];
  documents: WorkDocument[];
}

export interface NewWorkInput {
  name: string;
  operationId: number;
  state?: WorkState;
  plannedStartDate?: string;
  plannedEndDate?: string;
  notes?: string;
}

export interface UpdateWorkInput {
  name?: string;
  operationId?: number;
  state?: WorkState;
  plannedStartDate?: string;
  plannedEndDate?: string;
  realStartDate?: string;
  realEndDate?: string;
  notes?: string;
}

export interface WorkOptions {
  operations: { id: number; code: string; name: string }[];
  states: WorkState[];
  categories: string[];
  contractors: { id: number; name: string }[];
  documentTypes: string[];
  photoStages: PhotoStage[];
}

export interface WorkStatsSummary {
  activeCount: number;
  totalBudget: number;
  executedPercent: number;
  totalPaid: number;
}

export interface WorkFilterParams {
  query?: string;
  state?: string;
  operation?: string;
}

// TODO: trocar pelo endpoint quando existir. Cada função indica o pedido previsto.

export async function getWorks(filters?: WorkFilterParams): Promise<WorkCard[]> {
  // GET /api/v1/works
  return store.listWorks(filters);
}

export async function getWork(id: number): Promise<WorkDetail> {
  // GET /api/v1/works/:id
  return store.findWork(id);
}

export async function getWorkStats(): Promise<WorkStatsSummary> {
  return store.getStats();
}

export async function getWorkOptions(): Promise<WorkOptions> {
  return store.listOptions();
}

export async function createWork(input: NewWorkInput): Promise<WorkDetail> {
  // POST /api/v1/works
  return store.addWork(input);
}

export async function updateWork(id: number, input: UpdateWorkInput): Promise<WorkDetail> {
  // PATCH /api/v1/works/:id
  return store.updateWork(id, input);
}

export async function markWorkCompleted(id: number): Promise<WorkDetail> {
  // PATCH /api/v1/works/:id
  return store.markCompleted(id);
}

export async function saveBudgetItem(
  workId: number,
  item: Omit<BudgetItem, "id"> & { id?: string },
): Promise<WorkDetail> {
  // POST /api/v1/works/:id/budget-items ou PATCH /api/v1/budget-items/:id
  return store.saveBudgetItem(workId, item);
}

export async function deleteBudgetItem(workId: number, itemId: string): Promise<WorkDetail> {
  // DELETE /api/v1/budget-items/:id
  return store.deleteBudgetItem(workId, itemId);
}

export async function uploadWorkDocuments(
  workId: number,
  files: File[],
  type: string,
  photoStage?: PhotoStage,
): Promise<WorkDetail> {
  // POST /api/v1/works/:id/documents
  return store.addDocuments(workId, files, type, photoStage);
}
