import { contactErrors } from "../lib/contactRules";
import { apiFetch } from "./client";
import { findZoneId, listZones, type Zone } from "./zonesApi";

// Contactos: endpoints do Flask em /api/contacts (ver docs/api/contacts.md).

/** Papel que transforma um contacto em investidor. O backend esconde estes contactos da lista. */
export const INVESTOR_ROLE = "Investidor";
/** Tipo mostrado de um contacto sem papel (contactos antigos). Não se pode escolher: o tipo é obrigatório. */
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
  /** Id da zona (tabela editável em /api/zones), ou null sem zona. */
  zoneId: number | null;
  /** Nome da zona, só para mostrar. */
  zone: string;
  nif: string;
  address: string;
  notes: string;
  consentGiven: boolean;
  /** ISO; preenchida automaticamente quando o consentimento é dado. */
  consentDate?: string;
  consentChannel: string;
}

export type ContactInput = Omit<Contact, "id" | "zone">;

/** Linha da importação: a zona e o tipo vêm como texto e são convertidos nos ids do backend. */
export type ContactImportRow = Omit<ContactInput, "zoneId"> & { zoneName: string };

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
  zone: Zone | null;
  notes: string | null;
  nif: string | null;
  consent_given: boolean | null;
  consent_date: string | null;
  consent_channel: string | null;
}

interface Paginated<T> {
  data: T[];
  pagination: { page: number; per_page: number; total: number; pages: number; has_next: boolean };
}

/** Filtros que o GET /api/contacts/search aceita. */
export interface ContactSearch {
  /** Nome, email, telemóvel ou NIF. O backend só pesquisa a partir de 2 letras. */
  q?: string;
  /** Nome do papel (tipo). É convertido no id do papel. */
  type?: string;
  page: number;
  perPage: number;
}

export interface ContactPage {
  contacts: Contact[];
  total: number;
  pages: number;
}

/** Tamanho mínimo da pesquisa no backend (ContactSearchSchema). */
export const MIN_SEARCH_LENGTH = 2;

function fromApi(contact: ApiContact): Contact {
  return {
    id: contact.id,
    name: contact.name,
    roles: (contact.roles ?? []).map((role) => role.name),
    email: contact.email ?? "",
    phone: contact.phone_number ?? "",
    company: contact.company_name ?? "",
    zoneId: contact.zone?.id ?? null,
    zone: contact.zone?.name ?? "",
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
    ["name", "name"], ["email", "email"], ["phone", "phone_number"], ["company", "company_name"], ["zoneId", "zone_id"],
    ["nif", "nif"], ["address", "address"], ["notes", "notes"], ["consentGiven", "consent_given"], ["consentChannel", "consent_channel"],
  ];
  for (const [key, apiKey] of map) if (input[key] !== undefined) body[apiKey] = input[key];
  if (input.consentGiven !== undefined) body.consent_date = input.consentGiven ? (input.consentDate ?? new Date().toISOString()) : null;
  if (input.roles) body.role_ids = await roleIds(input.roles);
  return body;
}

async function listFromApi(): Promise<Contact[]> {
  const contacts: Contact[] = [];
  for (let page = 1; ; page++) {
    const result = await apiFetch<Paginated<ApiContact>>(`/contacts/?page=${page}&per_page=100`);
    contacts.push(...result.data.map(fromApi));
    if (!result.pagination.has_next) return contacts;
  }
}

// ---- Pedidos ----

/** Tipos que se podem escolher: os papéis do backend, sem Investidor. */
export async function listContactTypes(): Promise<string[]> {
  const roles = await apiFetch<ApiRole[]>("/contacts/roles");
  return roles.map((role) => role.name).filter((name) => !isInvestorRole(name));
}

/** Papéis que se podem usar no filtro por tipo (sem Investidor; "Outro" não existe no backend). */
export async function listContactRoles(): Promise<ApiRole[]> {
  const roles = await apiFetch<ApiRole[]>("/contacts/roles");
  return roles.filter((role) => !isInvestorRole(role.name));
}

/** Todos os contactos ativos, sem investidores. Só para escolher um contacto ou ver repetidos ao importar. */
export async function listContacts(): Promise<Contact[]> {
  return listFromApi();
}

/** Uma página de contactos, com a pesquisa, o filtro e a paginação feitos no backend. */
export async function searchContacts({ q = "", type = "", page, perPage }: ContactSearch): Promise<ContactPage> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  const text = q.trim();
  if (text.length >= MIN_SEARCH_LENGTH) params.set("q", text);
  if (type) {
    const role = (await listContactRoles()).find((item) => item.name.toLowerCase() === type.toLowerCase());
    // Um tipo que já não existe não tem contactos.
    if (!role) return { contacts: [], total: 0, pages: 0 };
    params.set("role_id", String(role.id));
  }
  const result = await apiFetch<Paginated<ApiContact>>(`/contacts/search?${params}`);
  return { contacts: result.data.map(fromApi), total: result.pagination.total, pages: result.pagination.pages };
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

/**
 * Cria as linhas válidas; são ignoradas as inválidas, as sem tipo, as com uma zona que não existe na tabela
 * de zonas e as repetidas (mesmo email ou nome).
 */
export async function importContacts(rows: ContactImportRow[]): Promise<{ created: number; skipped: number }> {
  const [existing, zones] = await Promise.all([listContacts(), listZones()]);
  const names = new Set(existing.map((contact) => contact.name.toLowerCase()));
  const emails = new Set(existing.map((contact) => contact.email.toLowerCase()).filter(Boolean));
  let created = 0;
  for (const { zoneName, ...row } of rows) {
    const email = row.email.trim().toLowerCase();
    const zoneId = findZoneId(zones, zoneName) ?? null;
    if (Object.keys(contactErrors(row)).length || !row.roles.length || (zoneName.trim() && zoneId === null)) continue;
    if (names.has(row.name.trim().toLowerCase()) || (email && emails.has(email))) continue;
    await createContact({ ...row, zoneId });
    names.add(row.name.trim().toLowerCase());
    if (email) emails.add(email);
    created += 1;
  }
  return { created, skipped: rows.length - created };
}

