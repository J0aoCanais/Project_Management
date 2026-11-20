import { contactErrors } from "../../lib/contactRules";
import { investmentErrors, investorProfileErrors } from "../../lib/investorRules";
import { investorsFixture } from "../../temp";
import { ApiError } from "../client";
import { getContact } from "../contactsApi";
import { listZones } from "../zonesApi";
import type { InvestmentInput, Investor, InvestorContact, InvestorDetail, InvestorProfile, InvestorRecord, NewInvestorInput } from "../investorsApi";

// TODO: trocar pelo endpoint quando existir. Simula o servidor: as alterações ficam em memória até recarregar.
// Ainda não há backend de investidores, por isso nunca altera os contactos reais: um contacto existente
// só é lido (os dados são copiados) e um contacto novo fica só aqui.

const LATENCY_MS = 150;
/** Contactos reais que já deram origem a um investidor de exemplo. */
const usedContactIds = new Set<number>();

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
  const { investments: _investments, ...investor } = toDetail(record);
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
  let contact: InvestorContact;
  let contactId: number | undefined;
  if ("contactId" in input) {
    if (usedContactIds.has(input.contactId)) throw new ApiError(409, "Este contacto já é investidor");
    contact = await getContact(input.contactId);
    contactId = input.contactId;
    usedContactIds.add(input.contactId);
  } else {
    rejectInvalid(contactErrors(input.contact), "Contacto inválido");
    const zones = input.contact.zoneId === null ? [] : await listZones();
    contact = { ...input.contact, zone: zones.find((zone) => zone.id === input.contact.zoneId)?.name ?? "" };
  }
  const record: InvestorRecord = {
    id: Math.max(0, ...investorsFixture.map((item) => item.id)) + 1,
    contactId,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    zone: contact.zone,
    profile: structuredClone(input.profile),
    investments: [],
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
