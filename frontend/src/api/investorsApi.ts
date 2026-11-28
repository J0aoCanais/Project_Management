import type { CaepTerm, InvestorKind } from "../lib/taxRules";
import type { ContactInput } from "./contactsApi";
import * as store from "./fixtures/investorsStore";

// Alinhado com `InvestorProfile` e `Investment` em app/models.py.
// Um investidor é um contacto com perfil de investidor: o id do investidor é o id do contacto.

export interface InvestorProfile {
  /** Particular ou Empresa: decide o imposto sobre o lucro (IRS ou IRC). "" enquanto não se escolhe. */
  investorKind: InvestorKind | "";
  /** Prazo do CAEP. Só conta numa empresa. */
  caepTerm: CaepTerm;
  availableCapital: number;
  /** Conservador, Moderado ou Agressivo. */
  riskProfile: string;
  /** Nomes das zonas (tabela de zonas). */
  preferredZones: string[];
  /** Montante mínimo por investimento, em euros. Só aparece no perfil (não na listagem). */
  minAmount: number;
  /** Montante máximo por investimento, em euros: mínimo ≤ máximo ≤ capital disponível. */
  maxAmount: number;
  preferredTerms: string;
  /** Por contactar, Inativo, Qualificado ou Ativo (`RELATION_STATUSES`). */
  relationStatus: string;
  notes: string;
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
  id: number;
  /** Contacto em /contactos. Os investidores de exemplo ainda não têm (não há backend de investidores). */
  contactId?: number;
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
