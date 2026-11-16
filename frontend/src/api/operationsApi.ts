import * as store from "./fixtures/operationsStore";
import type { OpportunityDocument } from "./opportunitiesApi";

export interface OperationCard {
  id: number;
  code: string;
  title: string;
  zone: string;
  typology: string;
  realPurchasePrice: number;
  advertisedPrice: number;
  finalSalePrice?: number;
  expectedMargin: number;
  phaseIndex: number;
  daysInPhase: number;
  owner: { name: string };
}

export interface ConstructionWork {
  id: number;
  code: string;
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
  budget: number;
  spent: number;
}

export interface OperationInvestment {
  investorId: number;
  investor: string;
  amount: number;
  sharePercent: number;
  returnType: string;
  rate: number;
}

export interface OperationDetail extends OperationCard {
  propertyCode: string;
  areaM2: number;
  opportunityId?: number;
  buyerName?: string;
  saleDeedDate?: string;
  phaseHistory: { from: string; to: string; date: string; note?: string }[];
  activity: { date: string; text: string }[];
  documents: OpportunityDocument[];
  constructionWorks: ConstructionWork[];
  investments: OperationInvestment[];
  cancellation?: { reason: string; date: string };
}

export interface NewOperation {
  opportunityId: number;
  buyerName: string;
  realPurchasePrice: number;
  advertisedPrice: number;
}

export interface OperationOptions {
  zones: string[];
  managers: string[];
  buyers: string[];
  nextCode: string;
  approvedOpportunities: { id: number; title: string; zone: string; askingPrice: number; vvr: number; buyerName: string }[];
}

export async function getOperations(): Promise<OperationCard[]> {
  return store.listOperations();
}

export async function getOperation(id: number): Promise<OperationDetail> {
  return store.findOperation(id);
}

export async function getOperationOptions(): Promise<OperationOptions> {
  return store.listOptions();
}

export async function createOperation(input: NewOperation): Promise<OperationDetail> {
  return store.addOperation(input);
}

export async function moveOperationPhase(id: number, phaseIndex: number): Promise<OperationDetail> {
  return store.movePhase(id, phaseIndex);
}

export async function cancelOperation(id: number, reason: string): Promise<OperationDetail> {
  return store.cancel(id, reason);
}

export async function uploadOperationDocuments(id: number, files: File[], type: string): Promise<OperationDetail> {
  return store.addDocuments(id, files, type);
}
