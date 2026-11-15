import { contactErrors } from "../lib/contactRules";
import { apiFetch } from "./client";

// Contactos: endpoints do Flask em /api/contacts (ver docs/api/contacts.md).

/** Papel que transforma um contacto em investidor. O backend esconde estes contactos da lista. */
export const INVESTOR_ROLE = "Investidor";
/** Tipo de um contacto sem papel conhecido. Não corresponde a nenhum papel no backend. */
export const OTHER_TYPE = "Outro";

// Alinhado com `Contact` em app/models.py. Campos opcionais vazios vêm como "".
export interface Contact {
  id: number;
  name: string;
  /** Nomes dos papéis (`Role`), ex.: ["Proprietário"]. */
  roles: string[];
  email: string;
  phone: string;
  company: string;
  zone: string;
  nif: string;
  address: string;
  notes: string;
  consentGiven: boolean;
  /** ISO; preenchida automaticamente quando o consentimento é dado. */
  consentDate?: string;
  consentChannel: string;
}

export type ContactInput = Omit<Contact, "id">;

const isInvestorRole = (role: string) => role.toLowerCase() === INVESTOR_ROLE.toLowerCase();

/** Tipo mostrado na lista: o primeiro papel que não é Investidor, senão "Outro". */
export function contactType(contact: Pick<Contact, "roles">): string {
  return contact.roles.find((role) => !isInvestorRole(role)) ?? OTHER_TYPE;
}

export function isInvestor(contact: Pick<Contact, "roles">): boolean {
  return contact.roles.some(isInvestorRole);
}

// ---- Formato do Flask ----

interface ApiRole {
  id: number;
  name: string;
}

interface ApiContact {
  id: number;
  name: string;
  roles: ApiRole[];
  email: string | null;
  phone_number: string | null;
  address: string | null;
  company_name: string | null;
  zone: string | null;
  notes: string | null;
  nif: string | null;
  consent_given: boolean | null;
  consent_date: string | null;
  consent_channel: string | null;
}

interface Paginated<T> {
  data: T[];
  pagination: { has_next: boolean };
}

function fromApi(contact: ApiContact): Contact {
  return {
    id: contact.id,
    name: contact.name,
    roles: (contact.roles ?? []).map((role) => role.name),
    email: contact.email ?? "",
    phone: contact.phone_number ?? "",
    company: contact.company_name ?? "",
    zone: contact.zone ?? "",
    nif: contact.nif ?? "",
    address: contact.address ?? "",
    notes: contact.notes ?? "",
    consentGiven: Boolean(contact.consent_given),
    consentDate: contact.consent_date ?? undefined,
    consentChannel: contact.consent_channel ?? "",
  };
}

/** Ids dos papéis pelo nome. Um papel que ainda não existe no backend é criado. */
async function roleIds(names: string[]): Promise<number[]> {
  const wanted = names.filter((name) => name !== OTHER_TYPE);
  if (!wanted.length) return [];
  const roles = await apiFetch<ApiRole[]>("/contacts/roles");
  const ids: number[] = [];
  for (const name of wanted) {
    const existing = roles.find((role) => role.name.toLowerCase() === name.toLowerCase());
    const role = existing ?? (await apiFetch<ApiRole>("/contacts/roles", { method: "POST", body: JSON.stringify({ name }) }));
    ids.push(role.id);
  }
  return ids;
}

/** Corpo do pedido só com os campos enviados (o PATCH deixa os outros como estão). Strings vazias ficam null no backend. */
async function toApi(input: Partial<ContactInput>): Promise<Record<string, unknown>> {
  const body: Record<string, unknown> = {};
  const map: [keyof ContactInput, string][] = [
    ["name", "name"], ["email", "email"], ["phone", "phone_number"], ["company", "company_name"], ["zone", "zone"],
    ["nif", "nif"], ["address", "address"], ["notes", "notes"], ["consentGiven", "consent_given"], ["consentChannel", "consent_channel"],
  ];
  for (const [key, apiKey] of map) if (input[key] !== undefined) body[apiKey] = input[key];
  if (input.consentGiven !== undefined) body.consent_date = input.consentGiven ? (input.consentDate ?? new Date().toISOString()) : null;
  if (input.roles) body.role_ids = await roleIds(input.roles);
  return body;
}

async function listFromApi(): Promise<Contact[]> {
  // TODO: quando a lista crescer, passar a pesquisa e os filtros para o servidor em vez de ler todas as páginas.
  const contacts: Contact[] = [];
  for (let page = 1; ; page++) {
    const result = await apiFetch<Paginated<ApiContact>>(`/contacts/?page=${page}&per_page=100`);
    contacts.push(...result.data.map(fromApi));
    if (!result.pagination.has_next) return contacts;
  }
}

// ---- Pedidos ----

/** Tipos que se podem escolher: os papéis do backend (sem Investidor) e "Outro" (sem papel). */
export async function listContactTypes(): Promise<string[]> {
  const roles = await apiFetch<ApiRole[]>("/contacts/roles");
  return [...roles.map((role) => role.name).filter((name) => !isInvestorRole(name)), OTHER_TYPE];
}

/** Contactos ativos, sem investidores (o backend já os tira da lista). */
export async function listContacts(): Promise<Contact[]> {
  return listFromApi();
}

export async function getContact(id: number): Promise<Contact> {
  return fromApi(await apiFetch<ApiContact>(`/contacts/${id}`));
}

export async function createContact(input: ContactInput): Promise<Contact> {
  const body = await toApi({ ...input, roles: input.roles });
  return fromApi(await apiFetch<ApiContact>("/contacts/add", { method: "POST", body: JSON.stringify(body) }));
}

export async function updateContact(id: number, changes: Partial<ContactInput>): Promise<Contact> {
  return fromApi(await apiFetch<ApiContact>(`/contacts/${id}`, { method: "PATCH", body: JSON.stringify(await toApi(changes)) }));
}

/** Soft delete: o contacto sai da lista mas o registo fica (deleted_at). */
export async function deleteContact(id: number): Promise<void> {
  await apiFetch<void>(`/contacts/${id}`, { method: "DELETE" });
}

/** Cria as linhas válidas; as inválidas e as repetidas (mesmo email ou nome) são ignoradas. */
export async function importContacts(rows: ContactInput[]): Promise<{ created: number; skipped: number }> {
  const existing = await listContacts();
  const names = new Set(existing.map((contact) => contact.name.toLowerCase()));
  const emails = new Set(existing.map((contact) => contact.email.toLowerCase()).filter(Boolean));
  let created = 0;
  for (const row of rows) {
    const email = row.email.trim().toLowerCase();
    if (Object.keys(contactErrors(row)).length || names.has(row.name.trim().toLowerCase()) || (email && emails.has(email))) continue;
    await createContact(row);
    names.add(row.name.trim().toLowerCase());
    if (email) emails.add(email);
    created += 1;
  }
  return { created, skipped: rows.length - created };
}

