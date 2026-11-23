import type { PropertyInput } from "../api/propertiesApi";
import { propertyTypeOptions, typologyOptions, zoneOptions } from "../temp";
import { isValidIsoDate } from "./format";
import { MONEY, fitsRule, titleError, type NumberRule } from "./opportunityRules";

// Limites dos campos dos imóveis. Usados pelo formulário e pelo servidor simulado.

export const AREA: NumberRule = { min: 0, max: 99_999, decimals: 2 };
export const MIN_AREA = 1;
export const MIN_CONSTRUCTION_YEAR = 1800;

export const PROPERTY_TEXT_LIMITS = {
  sourceUrl: 300,
  notes: 500,
} as const;

/** Erro do URL do anúncio (opcional): tem de começar por http(s):// e ser um endereço válido. */
export function urlError(url: string): string | undefined {
  const text = url.trim();
  if (!text) return undefined;
  if (text.length > PROPERTY_TEXT_LIMITS.sourceUrl) return `Máximo de ${PROPERTY_TEXT_LIMITS.sourceUrl} caracteres.`;
  try {
    const parsed = new URL(text);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "O URL tem de começar por http:// ou https://.";
    if (!parsed.hostname.includes(".")) return "Indique um endereço válido.";
  } catch {
    return "Indique um URL válido, como https://www.idealista.pt/…";
  }
  return undefined;
}

/** Erro do ano de construção (opcional): entre 1800 e o ano atual. */
export function yearError(year: number | undefined, currentYear = new Date().getFullYear()): string | undefined {
  if (year === undefined) return undefined;
  if (!Number.isInteger(year) || year < MIN_CONSTRUCTION_YEAR || year > currentYear) return `Ano entre ${MIN_CONSTRUCTION_YEAR} e ${currentYear}.`;
  return undefined;
}

export function areaError(area: number): string | undefined {
  if (!fitsRule(area, AREA) || area < MIN_AREA) return `Área entre ${MIN_AREA} e ${AREA.max.toLocaleString("pt-PT")} m².`;
  return undefined;
}

export function priceError(value: number, label: string): string | undefined {
  if (!fitsRule(value, MONEY) || value <= 0) return `Indique ${label}.`;
  return undefined;
}

export type PropertyErrors = Partial<Record<keyof PropertyInput, string>>;

/** Erros do formulário de imóvel, por campo. Vazio quando se pode guardar. */
export function propertyErrors(input: PropertyInput): PropertyErrors {
  const errors: PropertyErrors = {
    address: titleError(input.address),
    typology: typologyOptions.includes(input.typology) ? undefined : "Escolha a tipologia.",
    zone: zoneOptions.includes(input.zone) ? undefined : "Escolha a zona.",
    propertyType: propertyTypeOptions.includes(input.propertyType) ? undefined : "Escolha o tipo de imóvel.",
    areaM2: areaError(input.areaM2),
    constructionYear: yearError(input.constructionYear),
    askingPrice: priceError(input.askingPrice, "o preço pedido"),
    vvr: priceError(input.vvr, "o VVR"),
    visitDate: input.visitDate && !isValidIsoDate(input.visitDate) ? "Data de visita inválida." : undefined,
    sourceUrl: urlError(input.sourceUrl ?? ""),
    notes: (input.notes ?? "").length > PROPERTY_TEXT_LIMITS.notes ? `Máximo de ${PROPERTY_TEXT_LIMITS.notes} caracteres.` : undefined,
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as PropertyErrors;
}
