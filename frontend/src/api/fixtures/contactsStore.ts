import { contactErrors } from "../../lib/contactRules";
import { contactOperationsFixture, contactsFixture } from "../../temp";
import { ApiError } from "../client";
import type { Contact, ContactInput } from "../contactsApi";

// TODO: remover quando USE_CONTACTS_API ficar sempre ligado. Simula /api/contacts com as mesmas
// regras do backend: investidores e apagados fora da lista, apagados dão 404. Fica em memória até recarregar.

const LATENCY_MS = 150;
const deletedIds = new Set<number>();

const respond = async <T,>(value: T): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  return structuredClone(value);
};

function find(id: number): Contact {
  const contact = contactsFixture.find((item) => item.id === id);
  if (!contact || deletedIds.has(id)) throw new ApiError(404, "Contact not found");
  return contact;
}

/** O servidor valida sempre, mesmo que o formulário já o tenha feito. */
function validate(contact: ContactInput): void {
  const errors = contactErrors(contact);
  const first = Object.values(errors)[0];
  if (first) throw new ApiError(422, first, Object.fromEntries(Object.entries(errors).map(([key, message]) => [key, [message]])));
}

const isInvestor = (contact: Contact) => contact.roles.some((role) => role.toLowerCase() === "investidor");

export function list() {
  const visible = contactsFixture.filter((contact) => !deletedIds.has(contact.id) && !isInvestor(contact));
  return respond([...visible].sort((a, b) => a.name.localeCompare(b.name, "pt")));
}

export async function get(id: number) {
  await respond(null);
  return structuredClone(find(id));
}

export async function create(input: ContactInput) {
  await respond(null);
  validate(input);
  const contact: Contact = { ...structuredClone(input), id: Math.max(0, ...contactsFixture.map((item) => item.id)) + 1 };
  if (contact.consentGiven && !contact.consentDate) contact.consentDate = new Date().toISOString();
  contactsFixture.push(contact);
  return structuredClone(contact);
}

export async function update(id: number, changes: Partial<ContactInput>) {
  await respond(null);
  const contact = find(id);
  const next: Contact = { ...contact, ...structuredClone(changes) };
  validate(next);
  if (changes.consentGiven !== undefined) next.consentDate = next.consentGiven ? (contact.consentDate ?? new Date().toISOString()) : undefined;
  Object.assign(contact, next);
  return structuredClone(contact);
}

export async function remove(id: number) {
  await respond(null);
  find(id);
  deletedIds.add(id);
}

export function operations(id: number) {
  return respond(contactOperationsFixture[id] ?? []);
}
