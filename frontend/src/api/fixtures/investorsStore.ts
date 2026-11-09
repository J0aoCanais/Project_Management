import { investmentErrors, investorProfileErrors } from "../../lib/investorRules";
import { investorsFixture } from "../../temp";
import { ApiError } from "../client";
import { INVESTOR_ROLE, createContact, getContact, updateContact, type Contact } from "../contactsApi";
import type { InvestmentInput, Investor, InvestorDetail, InvestorProfile, InvestorRecord, NewInvestorInput } from "../investorsApi";

// TODO: trocar pelo endpoint quando existir. Simula o servidor: as alterações ficam em memória até recarregar.
// O contacto é criado/atualizado pela API de contactos, por isso respeita USE_CONTACTS_API.

const LATENCY_MS = 150;

const respond = async <T,>(value: T): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  return structuredClone(value);
};

function find(id: number): InvestorRecord {
  const investor = investorsFixture.find((item) => item.id === id);
  if (!investor) throw new ApiError(404, "Investidor não encontrado");
  return investor;
}

function toDetail(record: InvestorRecord): InvestorDetail {
  return { ...record, committedCapital: record.investments.reduce((total, item) => total + item.committedValue, 0) };
}

function toListItem(record: InvestorRecord): Investor {
  const { investments: _investments, documents: _documents, ...investor } = toDetail(record);
  return investor;
}

function rejectInvalid(errors: Record<string, string | undefined>, message: string): void {
  if (Object.keys(errors).length) throw new ApiError(422, message);
}

export function list() {
  return respond([...investorsFixture].sort((a, b) => a.name.localeCompare(b.name, "pt")).map(toListItem));
}

export async function get(id: number) {
  await respond(null);
  return structuredClone(toDetail(find(id)));
}

export async function create(input: NewInvestorInput) {
  await respond(null);
  rejectInvalid(investorProfileErrors(input.profile), "Perfil de investidor inválido");
  let contact: Contact;
  if ("contactId" in input) {
    // Contacto existente: ganha o papel de investidor, não se cria outro.
    if (investorsFixture.some((item) => item.id === input.contactId)) throw new ApiError(409, "Este contacto já é investidor");
    const existing = await getContact(input.contactId);
    contact = await updateContact(existing.id, { roles: [...existing.roles, INVESTOR_ROLE] });
  } else {
    contact = await createContact({ ...input.contact, roles: [INVESTOR_ROLE] });
  }
  const record: InvestorRecord = {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    zone: contact.zone,
    profile: structuredClone(input.profile),
    investments: [],
    documents: [],
  };
  investorsFixture.push(record);
  return structuredClone(toDetail(record));
}

export async function updateProfile(id: number, profile: InvestorProfile) {
  await respond(null);
  const investor = find(id);
  rejectInvalid(investorProfileErrors(profile), "Perfil de investidor inválido");
  investor.profile = structuredClone(profile);
  return structuredClone(toDetail(investor));
}

export async function addInvestment(id: number, input: InvestmentInput) {
  await respond(null);
  const investor = find(id);
  rejectInvalid(investmentErrors(input), "Investimento inválido");
  const nextId = Math.max(0, ...investorsFixture.flatMap((item) => item.investments.map((investment) => investment.id))) + 1;
  investor.investments.unshift({ ...structuredClone(input), id: nextId });
  return structuredClone(toDetail(investor));
}
