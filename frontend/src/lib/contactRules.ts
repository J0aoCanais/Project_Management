import { leadNameError, optionalTextError, phoneError } from "./leadRules";

// Limites dos campos dos contactos. Usados pelo formulário (não deixa escrever além disto)
// e pelo servidor simulado (recusa o que chegar fora disto).

export const CONTACT_TEXT_LIMITS = {
  name: 80,
  email: 120,
  company: 80,
  address: 200,
  notes: 500,
  nif: 9,
} as const;

/** Campos de um contacto que o formulário valida. */
export interface ContactFields {
  name: string;
  email: string;
  phone: string;
  company: string;
  nif: string;
  address: string;
  notes: string;
  consentGiven: boolean;
  consentChannel: string;
}

export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

/** Deixa só dígitos no NIF, até 9. */
export function sanitizeNif(value: string): string {
  return value.replace(/\D/g, "").slice(0, CONTACT_TEXT_LIMITS.nif);
}

/** Erro de um email opcional, ou `undefined` se estiver vazio ou bem escrito. */
export function emailError(email: string): string | undefined {
  const text = email.trim();
  if (!text) return undefined;
  if (text.length > CONTACT_TEXT_LIMITS.email) return `Máximo de ${CONTACT_TEXT_LIMITS.email} caracteres.`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text)) return "Indique um email válido (ex.: nome@exemplo.pt).";
  return undefined;
}

/** Erro de um NIF opcional: 9 dígitos e dígito de controlo certo. */
export function nifError(nif: string): string | undefined {
  const text = nif.trim();
  if (!text) return undefined;
  if (!/^\d{9}$/.test(text)) return "O NIF tem 9 dígitos.";
  const sum = [...text.slice(0, 8)].reduce((total, digit, index) => total + Number(digit) * (9 - index), 0);
  const check = 11 - (sum % 11);
  return (check >= 10 ? 0 : check) === Number(text[8]) ? undefined : "NIF inválido. Confirme os dígitos.";
}

/** Erros do contacto, por campo. Vazio quando se pode guardar. */
export function contactErrors(contact: ContactFields): ContactErrors {
  const errors: ContactErrors = {
    name: leadNameError(contact.name),
    email: emailError(contact.email),
    phone: contact.phone.trim() ? phoneError(contact.phone) : undefined,
    company: optionalTextError(contact.company, CONTACT_TEXT_LIMITS.company),
    nif: nifError(contact.nif),
    address: optionalTextError(contact.address, CONTACT_TEXT_LIMITS.address),
    notes: optionalTextError(contact.notes, CONTACT_TEXT_LIMITS.notes),
    consentChannel: contact.consentGiven && !contact.consentChannel ? "Indique por onde foi dado o consentimento." : undefined,
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as ContactErrors;
}
