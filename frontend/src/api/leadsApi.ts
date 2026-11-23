import { LEAD_TEXT_LIMITS, leadNameError, optionalTextError, phoneError } from "../lib/leadRules";
import { leads, leadContacts, settingsLeadSourcesFixture } from "../temp";
import { ApiError } from "./client";

export type LeadStatus = "Nova" | "Contactada" | "Qualificada" | "Convertida" | "Descartada";

export interface Lead {
  id: number;
  contactName: string;
  phone: string;
  referredBy: string;
  zone: string;
  source: string;
  status: LeadStatus;
  message?: string;
  discardReason?: string;
  createdAt: string;
}

export interface LeadContactEntry {
  id: number;
  date: string;
  channel: string;
  owner: string;
  result: string;
  note: string;
}

export interface NewLeadInput {
  contactName: string;
  phone: string;
  referredBy: string;
  zone: string;
  source: string;
  message?: string;
  status?: LeadStatus;
  createdAt?: string;
}

const delay = async <T>(value: T): Promise<T> => {
  await Promise.resolve();
  return value;
};

export async function listLeads(): Promise<Lead[]> {
  return delay(leads);
}

export async function getLead(id: number): Promise<Lead & { contacts: LeadContactEntry[] }> {
  const lead = leads.find((item) => item.id === id);
  if (!lead) throw new Error("Lead não encontrada");
  return delay({ ...lead, contacts: leadContacts[id] ?? [] });
}

function leadInputError(input: NewLeadInput): string | undefined {
  return (
    leadNameError(input.contactName) ??
    phoneError(input.phone) ??
    (input.zone ? undefined : "Zona em falta") ??
    (settingsLeadSourcesFixture.some((source) => source.name === input.source && source.isActive) ? undefined : "Origem inválida ou inativa") ??
    optionalTextError(input.referredBy, LEAD_TEXT_LIMITS.referredBy) ??
    optionalTextError(input.message ?? "", LEAD_TEXT_LIMITS.message)
  );
}

export async function createLead(input: NewLeadInput): Promise<Lead> {
  const invalid = leadInputError(input);
  if (invalid) throw new ApiError(422, invalid);
  const lead: Lead = { id: Math.max(0, ...leads.map((item) => item.id)) + 1, status: input.status ?? "Nova", createdAt: input.createdAt ?? new Date().toISOString(), contactName: input.contactName, phone: input.phone, referredBy: input.referredBy, zone: input.zone, source: input.source, message: input.message };
  leads.unshift(lead);
  return delay(lead);
}

export async function updateLeadStatus(id: number, status: LeadStatus, discardReason?: string): Promise<Lead> {
  const lead = leads.find((item) => item.id === id);
  if (!lead) throw new Error("Lead não encontrada");
  lead.status = status;
  lead.discardReason = discardReason;
  return delay(lead);
}

export async function addLeadContact(id: number, entry: Omit<LeadContactEntry, "id">): Promise<LeadContactEntry> {
  if (!leads.some((lead) => lead.id === id)) throw new Error("Lead não encontrada");
  const entries = leadContacts[id] ?? (leadContacts[id] = []);
  const contact = { ...entry, id: Math.max(0, ...entries.map((item) => item.id)) + 1 };
  entries.unshift(contact);
  return delay(contact);
}

export async function importLeads(rows: NewLeadInput[]): Promise<{ created: number; skipped: number }> {
  const names = new Set(leads.map((lead) => lead.contactName.toLowerCase()));
  let created = 0;
  for (const row of rows) {
    if (leadInputError(row) || names.has(row.contactName.toLowerCase())) continue;
    await createLead(row);
    names.add(row.contactName.toLowerCase());
    created += 1;
  }
  return delay({ created, skipped: rows.length - created });
}

/** Marca a lead como convertida. A oportunidade é criada antes, com `createOpportunity({ leadId })`. */
export async function convertLead(id: number): Promise<Lead> {
  const lead = leads.find((item) => item.id === id);
  if (!lead) throw new ApiError(404, "Lead não encontrada");
  if (lead.status === "Convertida" || lead.status === "Descartada") throw new ApiError(409, `A lead já está ${lead.status.toLowerCase()}`);
  return updateLeadStatus(id, "Convertida");
}
