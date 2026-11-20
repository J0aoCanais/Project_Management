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
  /** Parte do lucro que vai para o investidor ativo, em percentagem (0–100, 2 casas). O resto fica para a empresa. */
  investorSharePercent: number;
}

export interface ExtraCost {
  id: string;
  label: string;
  value: number;
}

export interface OpportunityDetail extends OpportunityCard {
  property: {
    /** Imóvel em /imoveis, quando já está registado. */
    id?: number;
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
  /** Contacto em /contactos (`Opportunity.contact_id`). */
  contactId?: number;
  updatedAt: string;
  finance: FinanceValues;
  extraCosts: ExtraCost[];
  phaseHistory: { from: string; to: string; date: string; note?: string }[];
  activity: { date: string; text: string }[];
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
  /** Contacto associado (`Opportunity.contact_id`). */
  contactId?: number;
  leadId?: number;
  /** Imóvel já registado de onde foi criada. */
  propertyId?: number;
}

/** Dados que se podem editar depois de criada (a lead e o imóvel de origem não mudam). */
export type OpportunityChanges = Omit<NewOpportunity, "leadId" | "propertyId">;

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

export async function updateOpportunity(id: number, changes: OpportunityChanges): Promise<OpportunityDetail> {
  // PATCH /v1/opportunities/${id}
  return store.updateOpportunity(id, changes);
}

export async function moveOpportunityPhase(id: number, phaseIndex: number, note = ""): Promise<OpportunityDetail> {
  // PATCH /v1/opportunities/${id}/phase  { phase, note }  (PhaseHistory.note)
  return store.movePhase(id, phaseIndex, note);
}

/** Acrescenta ou edita a nota de uma linha do histórico de fases (`index` 0 = a mudança mais recente). */
export async function updatePhaseNote(id: number, index: number, note: string): Promise<OpportunityDetail> {
  // PATCH /v1/opportunities/${id}/phase-history/${historyId}  { note }
  return store.setPhaseNote(id, index, note);
}

export async function saveOpportunityFinance(id: number, finance: FinanceValues, extraCosts: ExtraCost[]): Promise<OpportunityDetail> {
  // PUT /v1/opportunities/${id}/finance
  return store.saveFinance(id, finance, extraCosts);
}

export async function rejectOpportunity(id: number, reason: string): Promise<OpportunityDetail> {
  // PATCH /v1/opportunities/${id}
  return store.reject(id, reason);
}

export async function convertOpportunity(id: number): Promise<{ operationId: number }> {
  // POST /v1/opportunities/${id}/convert
  return store.convert(id);
}
