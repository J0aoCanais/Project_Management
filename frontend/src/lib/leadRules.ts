// Limites dos campos das leads. Usados pelos formulários (não deixam escrever além disto)
// e pelo servidor simulado (recusa o que chegar fora disto).

export const LEAD_TEXT_LIMITS = {
  contactName: 80,
  phone: 20,
  referredBy: 80,
  message: 500,
  contactOwner: 80,
  contactResult: 120,
  contactNote: 500,
} as const;

export const MIN_NAME_LENGTH = 2;
export const MIN_PHONE_DIGITS = 9;
export const MAX_PHONE_DIGITS = 15;

/** Deixa só dígitos, espaços e um "+" inicial (ex.: +351 912 345 678). */
export function sanitizePhone(value: string): string {
  const cleaned = value.replace(/[^\d+ ]/g, "").replace(/(?!^)\+/g, "");
  return cleaned.slice(0, LEAD_TEXT_LIMITS.phone);
}

/** Palavra mais comprida aceite. Uma palavra enorme sem espaços não cabe nos campos da ficha. */
export const MAX_WORD_LENGTH = 40;

/** Erro do nome de uma lead, ou `undefined` se estiver bem. */
export function leadNameError(name: string): string | undefined {
  const text = name.trim();
  if (!text) return "Indique o nome.";
  if (text.length < MIN_NAME_LENGTH) return `Escreva pelo menos ${MIN_NAME_LENGTH} caracteres.`;
  if (text.length > LEAD_TEXT_LIMITS.contactName) return `Máximo de ${LEAD_TEXT_LIMITS.contactName} caracteres.`;
  if (!/^\p{L}[\p{L} .'-]*$/u.test(text)) return "O nome só pode ter letras, espaços, hífens e apóstrofos.";
  return longWordError(text);
}

/** Erro de uma palavra demasiado longa (sem espaços), ou `undefined`. */
export function longWordError(value: string): string | undefined {
  return value.split(/\s+/).some((word) => word.length > MAX_WORD_LENGTH)
    ? `Há uma palavra com mais de ${MAX_WORD_LENGTH} caracteres. Separe o texto com espaços.`
    : undefined;
}

/** Erro de um texto opcional: demasiado longo ou com palavras enormes. */
export function optionalTextError(value: string, max: number): string | undefined {
  return maxLengthError(value, max) ?? longWordError(value.trim());
}

/** Erro do telemóvel de uma lead, ou `undefined` se estiver bem. */
export function phoneError(phone: string): string | undefined {
  const text = phone.trim();
  if (!text) return "Indique o telemóvel.";
  if (text.length > LEAD_TEXT_LIMITS.phone || !/^\+?[\d ]+$/.test(text)) return "Só são permitidos números.";
  const digits = text.replace(/\D/g, "").length;
  if (digits < MIN_PHONE_DIGITS || digits > MAX_PHONE_DIGITS) return `Indique entre ${MIN_PHONE_DIGITS} e ${MAX_PHONE_DIGITS} dígitos.`;
  return undefined;
}

/** Erro de um texto opcional demasiado longo. */
export function maxLengthError(value: string, max: number): string | undefined {
  return value.trim().length > max ? `Máximo de ${max} caracteres.` : undefined;
}
