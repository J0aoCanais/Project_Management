import * as store from "./fixtures/propertiesStore";

// Alinhado com `Property` em app/models.py.
export interface PropertySummary {
  id: number;
  /** "IM-1042" */
  code: string;
  address: string;
  zone: string;
  typology: string;
  propertyType: string;
  areaM2: number;
  askingPrice: number;
  vvr: number;
  /** Margem prevista com os pressupostos por omissão (igual à de uma oportunidade nova). */
  estimatedProfit: number;
  /** "aaaa-mm-dd" */
  visitDate?: string;
}

/** Oportunidade ou operação sobre este imóvel. */
export interface PropertyRelatedRecord {
  kind: "opportunity" | "operation";
  id: number;
  name: string;
  phase: string;
}

export interface PropertyDetail extends PropertySummary {
  constructionYear?: number;
  sourceUrl?: string;
  notes?: string;
  condition?: string;
  energyCertificate?: string;
  related: PropertyRelatedRecord[];
}

export interface PropertyInput {
  address: string;
  typology: string;
  zone: string;
  propertyType: string;
  areaM2: number;
  constructionYear?: number;
  askingPrice: number;
  vvr: number;
  visitDate?: string;
  sourceUrl?: string;
  notes?: string;
}

// TODO: trocar pelo endpoint quando existir. Cada função indica o pedido previsto.

export async function getProperties(): Promise<PropertySummary[]> {
  // apiFetch<PropertySummary[]>("/v1/properties")
  return store.listProperties();
}

export async function getProperty(id: number): Promise<PropertyDetail> {
  // apiFetch<PropertyDetail>(`/v1/properties/${id}`)
  return store.findProperty(id);
}

export async function createProperty(input: PropertyInput): Promise<PropertyDetail> {
  // POST /v1/properties
  return store.addProperty(input);
}

export async function updateProperty(id: number, input: PropertyInput): Promise<PropertyDetail> {
  // PATCH /v1/properties/${id}
  return store.editProperty(id, input);
}
