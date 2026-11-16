import { calcFinance } from "../../lib/finance";
import { OPPORTUNITY_PHASES } from "../../lib/phases";
import { propertyErrors } from "../../lib/propertyRules";
import { ApiError } from "../client";
import type { PropertyDetail, PropertyInput, PropertySummary } from "../propertiesApi";
import { defaultFinance, operationRefs, opportunitiesFixture, propertiesFixture } from "../../temp";
import { respond } from "./respond";

// TODO: trocar pelo endpoint quando existir. Simula o servidor: as alterações ficam em memória até recarregar a página.

type PropertyRecord = (typeof propertiesFixture)[number];

function find(id: number): PropertyRecord {
  const property = propertiesFixture.find((item) => item.id === id);
  if (!property) throw new ApiError(404, "Imóvel não encontrado");
  return property;
}

function toSummary({ id, code, address, zone, typology, propertyType, areaM2, askingPrice, vvr, visitDate }: PropertyRecord): PropertySummary {
  // A mesma margem que uma oportunidade nova com estes preços teria.
  const estimatedProfit = calcFinance(defaultFinance(askingPrice, vvr), []).margin;
  return { id, code, address, zone, typology, propertyType, areaM2, askingPrice, vvr, estimatedProfit, visitDate };
}

function toDetail(property: PropertyRecord): PropertyDetail {
  const opportunities = opportunitiesFixture
    .filter((item) => item.property.id === property.id)
    .map((item) => ({
      kind: "opportunity" as const,
      id: item.id,
      name: item.title,
      phase: item.rejection ? "Rejeitada/perdida" : item.operationId ? "Convertida em operação" : OPPORTUNITY_PHASES[item.phaseIndex].name,
    }));
  const operations = operationRefs
    .filter((item) => item.propertyId === property.id)
    .map((item) => ({ kind: "operation" as const, id: item.id, name: item.code, phase: item.phase }));
  return { ...property, ...toSummary(property), related: [...operations, ...opportunities] };
}

/** Limpa o que vem do formulário: textos sem espaços a mais e opcionais vazios fora. */
function clean(input: PropertyInput): Omit<PropertyRecord, "id" | "code"> {
  const invalid = Object.values(propertyErrors(input))[0];
  if (invalid) throw new ApiError(422, invalid);
  return {
    address: input.address.trim(),
    typology: input.typology,
    zone: input.zone,
    propertyType: input.propertyType,
    areaM2: input.areaM2,
    constructionYear: input.constructionYear,
    askingPrice: input.askingPrice,
    vvr: input.vvr,
    visitDate: input.visitDate || undefined,
    sourceUrl: input.sourceUrl?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
  };
}

export function listProperties() {
  return respond(propertiesFixture.map(toSummary));
}

export async function findProperty(id: number) {
  await respond(null);
  return structuredClone(toDetail(find(id)));
}

export async function addProperty(input: PropertyInput) {
  await respond(null);
  const values = clean(input);
  const id = Math.max(1000, ...propertiesFixture.map((item) => item.id)) + 1;
  const property: PropertyRecord = { id, code: `IM-${id}`, ...values };
  propertiesFixture.unshift(property);
  return structuredClone(toDetail(property));
}

export async function editProperty(id: number, input: PropertyInput) {
  await respond(null);
  const property = find(id);
  Object.assign(property, clean(input));
  return structuredClone(toDetail(property));
}
