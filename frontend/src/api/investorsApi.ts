import type { ContactInput } from "./contactsApi";
import type { DocumentRecord } from "./documentsApi";
import * as store from "./fixtures/investorsStore";

// Alinhado com `InvestorProfile` e `Investment` em app/models.py.
// Um investidor é um contacto com perfil de investidor: o id do investidor é o id do contacto.

export interface InvestorProfile {
  availableCapital: number;
  /** Conservador, Moderado ou Agressivo. */
  riskProfile: string;
  preferredZones: string[];
  minAmount: number;
  maxAmount: number;
  preferredTerms: string;
  relationStatus: string;
}

/** Dados do contacto mostrados com o investidor. */
export interface InvestorContact {
  name: string;
  email: string;
  phone: string;
  company: string;
  zone: string;
}

export interface Investor extends InvestorContact {
  /** O mesmo id do contacto. */
  id: number;
  profile: InvestorProfile;
  /** Soma dos valores comprometidos nos investimentos. */
  committedCapital: number;
}

export interface Investment {
  id: number;
  operationCode: string;
  committedValue: number;
  participationPercent: number;
  /** Juro fixo ou Participação nos lucros. */
  returnType: string;
  returnRate: number;
  /** "2026-11-08" */
  agreementDate: string;
}

export type InvestmentInput = Omit<Investment, "id">;

export interface InvestorDetail extends Investor {
  investments: Investment[];
  documents: DocumentRecord[];
}

/** Investidor guardado: o que o servidor tem antes de calcular os totais. */
export type InvestorRecord = Omit<InvestorDetail, "committedCapital">;

/** Novo investidor a partir de um contacto existente (sem o duplicar) ou de um contacto novo. */
export type NewInvestorInput = { profile: InvestorProfile } & ({ contactId: number } | { contact: ContactInput });

// TODO: trocar pelo endpoint quando existir. Cada função indica o pedido previsto.

export async function listInvestors(): Promise<Investor[]> {
  // GET /api/v1/investors
  return store.list();
}

export async function getInvestor(id: number): Promise<InvestorDetail> {
  // GET /api/v1/investors/${id} + GET /api/v1/investors/${id}/investments
  return store.get(id);
}

export async function createInvestor(input: NewInvestorInput): Promise<InvestorDetail> {
  // POST /api/v1/investors  { contact_id | contact, profile }
  return store.create(input);
}

export async function updateInvestorProfile(id: number, profile: InvestorProfile): Promise<InvestorDetail> {
  // PATCH /api/v1/investors/${id}
  return store.updateProfile(id, profile);
}

export async function createInvestment(investorId: number, input: InvestmentInput): Promise<InvestorDetail> {
  // POST /api/v1/investors/${investorId}/investments
  return store.addInvestment(investorId, input);
}
