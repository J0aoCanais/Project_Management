import * as store from "./fixtures/opportunitiesStore";

// Alinhado com `Opportunity` e `Property` em app/models.py.
export interface OpportunityCard {
  id: number;
  /** Morada ou nome do imóvel. */
  title: string;
  zone: string;
  /** T1, T2… */
  typology: string;
  askingPrice: number;
  vvr: number;
  estimatedProfit: number;
  /** 0–7, índice em OPPORTUNITY_PHASES. */
  phaseIndex: number;
  daysInPhase: number;
  owner: { name: string };
}

export interface FinanceValues {
  purchasePrice: number;
  imt: number;
  stampDuty: number;
  deedCosts: number;
  workCost: number;
  expectedSalePrice: number;
  commissionPercent: number;
  commissionVatPercent: number;
  termMonths: number;
}

export interface ExtraCost {
  id: string;
  label: string;
  value: number;
}

export interface OpportunityDocument {
  id: string;
  name: string;
  type: string;
  propertyCode: string;
  entity: string;
  sizeBytes: number;
  validUntil?: string;
  status: string;
}

export interface OpportunityDetail extends OpportunityCard {
  property: {
    code: string;
    areaM2: number;
    visitDate?: string;
    notes?: string;
    constructionYear?: number;
    condition?: string;
    energyCertificate?: string;
    photos?: { url: string; caption: string }[];
  };
  contactName?: string;
  updatedAt: string;
  finance: FinanceValues;
  extraCosts: ExtraCost[];
  phaseHistory: { from: string; to: string; date: string; note?: string }[];
  activity: { date: string; text: string }[];
  documents: OpportunityDocument[];
  /** Preenchido quando foi marcada como rejeitada/perdida; sai do quadro. */
  rejection?: { reason: string; date: string };
  /** Preenchido quando foi convertida em operação; sai do quadro. */
  operationId?: number;
}

export interface NewOpportunity {
  title: string;
  typology: string;
  zone: string;
  askingPrice: number;
  vvr: number;
  leadId?: number;
}

export interface OpportunityOptions {
  zones: string[];
  managers: string[];
  leads: { id: number; name: string }[];
}

// TODO: trocar pelo endpoint quando existir. Cada função indica o pedido previsto.

export async function getOpportunities(): Promise<OpportunityCard[]> {
  // apiFetch<OpportunityCard[]>("/v1/opportunities")
  return store.listOpportunities();
}

export async function getOpportunity(id: number): Promise<OpportunityDetail> {
  // apiFetch<OpportunityDetail>(`/v1/opportunities/${id}`)
  return store.findOpportunity(id);
}

export async function getOpportunityOptions(): Promise<OpportunityOptions> {
  return store.listOptions();
}

export async function createOpportunity(input: NewOpportunity): Promise<OpportunityDetail> {
  // POST /v1/opportunities
  return store.addOpportunity(input);
}

export async function moveOpportunityPhase(id: number, phaseIndex: number): Promise<OpportunityDetail> {
  // PATCH /v1/opportunities/${id}/phase
  return store.movePhase(id, phaseIndex);
}

export async function saveOpportunityFinance(id: number, finance: FinanceValues, extraCosts: ExtraCost[]): Promise<OpportunityDetail> {
  // PUT /v1/opportunities/${id}/finance
  return store.saveFinance(id, finance, extraCosts);
}

export async function uploadOpportunityDocuments(id: number, files: File[], type: string): Promise<OpportunityDetail> {
  // POST /v1/opportunities/${id}/documents
  return store.addDocuments(id, files, type);
}

export async function rejectOpportunity(id: number, reason: string): Promise<OpportunityDetail> {
  // PATCH /v1/opportunities/${id}
  return store.reject(id, reason);
}

export async function convertOpportunity(id: number): Promise<{ operationId: number }> {
  // POST /v1/opportunities/${id}/convert
  return store.convert(id);
}
