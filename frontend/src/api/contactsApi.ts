import { contactErrors } from "../lib/contactRules";
import { USE_CONTACTS_API, contactTypeOptions } from "../temp";
import { apiFetch } from "./client";
import * as store from "./fixtures/contactsStore";

// Contactos: endpoints reais em /api/contacts (ver docs/api/contacts.md). Enquanto o backend
// não corre em todos os PCs, USE_CONTACTS_API (em temp.tsx) escolhe entre o Flask e os dados de exemplo.

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

export interface ContactOperation {
  code: string;
  /** Papel do contacto na operação, ex.: "Proprietário (vendedor)". */
  role: string;
  phase: string;
}

/** Tipo mostrado na lista: o primeiro papel conhecido, senão "Outro". */
export function contactType(contact: Pick<Contact, "roles">): string {
  const known = [...contactTypeOptions, INVESTOR_ROLE];
  for (const role of contact.roles) {
    const match = known.find((type) => type.toLowerCase() === role.toLowerCase());
    if (match) return match;
  }
  return OTHER_TYPE;
}

export function isInvestor(contact: Pick<Contact, "roles">): boolean {
  return contact.roles.some((role) => role.toLowerCase() === INVESTOR_ROLE.toLowerCase());
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

/** Contactos ativos, sem investidores (esses estão em /investidores). */
export async function listContacts(): Promise<Contact[]> {
  return USE_CONTACTS_API ? listFromApi() : store.list();
}

export async function getContact(id: number): Promise<Contact> {
  return USE_CONTACTS_API ? fromApi(await apiFetch<ApiContact>(`/contacts/${id}`)) : store.get(id);
}

export async function createContact(input: ContactInput): Promise<Contact> {
  if (!USE_CONTACTS_API) return store.create(input);
  const body = await toApi({ ...input, roles: input.roles });
  return fromApi(await apiFetch<ApiContact>("/contacts/add", { method: "POST", body: JSON.stringify(body) }));
}

export async function updateContact(id: number, changes: Partial<ContactInput>): Promise<Contact> {
  if (!USE_CONTACTS_API) return store.update(id, changes);
  return fromApi(await apiFetch<ApiContact>(`/contacts/${id}`, { method: "PATCH", body: JSON.stringify(await toApi(changes)) }));
}

/** Soft delete: o contacto sai da lista mas o registo fica (deleted_at). */
export async function deleteContact(id: number): Promise<void> {
  if (!USE_CONTACTS_API) return store.remove(id);
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

/** Operações em que o contacto participa. */
export async function getContactOperations(id: number): Promise<ContactOperation[]> {
  // TODO: trocar pelo endpoint quando existir (GET /api/contacts/:id/operations).
  return store.operations(id);
}
