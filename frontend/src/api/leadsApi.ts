import { leads, leadContacts } from "./fixtures/testData";

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

export async function createLead(input: NewLeadInput): Promise<Lead> {
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
    if (names.has(row.contactName.toLowerCase())) continue;
    await createLead(row);
    names.add(row.contactName.toLowerCase());
    created += 1;
  }
  return delay({ created, skipped: rows.length - created });
}

export async function convertLead(id: number): Promise<{ opportunityId: number }> {
  await updateLeadStatus(id, "Convertida");
  return delay({ opportunityId: 1000 + id });
}
