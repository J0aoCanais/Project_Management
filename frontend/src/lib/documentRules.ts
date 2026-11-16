import type { DocumentOwnerKind, DocumentRecord } from "../api/documentsApi";
import { documentTypesByOwner, requiredDocumentTypes } from "../temp";
import { PHOTO_STAGES } from "./workRules";
import { daysBetween, isValidIsoDate } from "./format";

// Regras dos documentos. Usadas pelo formulário de carregamento e pelo servidor simulado.

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_FILES_PER_UPLOAD = 20;
export const MAX_FILE_NAME_LENGTH = 120;
/** Um documento passa a "A expirar" quando faltam menos do que estes dias. */
export const EXPIRY_WARNING_DAYS = 30;

export const OWNER_KIND_LABELS: Record<DocumentOwnerKind, string> = {
  opportunity: "Oportunidade",
  operation: "Operação",
  work: "Obra",
  investment: "Investimento",
  movement: "Movimento",
  property: "Imóvel",
};

export const OWNER_KINDS = Object.keys(OWNER_KIND_LABELS) as DocumentOwnerKind[];

export function ownerKindFromLabel(label: string): DocumentOwnerKind | undefined {
  return OWNER_KINDS.find((kind) => OWNER_KIND_LABELS[kind] === label);
}

/** Tipos de documento que se podem escolher para cada entidade. */
export function documentTypesFor(kind: DocumentOwnerKind): string[] {
  return documentTypesByOwner[kind];
}

/** Tipos obrigatórios que ainda não foram carregados. */
export function missingRequiredTypes(kind: DocumentOwnerKind, documents: Pick<DocumentRecord, "type">[]): string[] {
  const loaded = new Set(documents.map((document) => document.type));
  return (requiredDocumentTypes[kind] ?? []).filter((type) => !loaded.has(type));
}

export type ExpiryStatus = "Sem validade" | "Válido" | "A expirar" | "Expirado";

export function expiryStatus(expiryDate: string | undefined, today: string): ExpiryStatus {
  if (!expiryDate) return "Sem validade";
  const days = daysBetween(today, expiryDate);
  if (days < 0) return "Expirado";
  if (days < EXPIRY_WARNING_DAYS) return "A expirar";
  return "Válido";
}

const MEGABYTE = 1024 * 1024;

/** Erro dos ficheiros escolhidos, ou `undefined` se se podem enviar. */
export function filesError(files: Pick<File, "name" | "size">[]): string | undefined {
  if (!files.length) return "Escolha pelo menos um ficheiro.";
  if (files.length > MAX_FILES_PER_UPLOAD) return `Pode carregar no máximo ${MAX_FILES_PER_UPLOAD} ficheiros de cada vez.`;
  const tooBig = files.filter((file) => file.size > MAX_FILE_BYTES);
  if (tooBig.length) {
    const names = tooBig.map((file) => file.name).join(", ");
    return `${tooBig.length === 1 ? "O ficheiro" : "Os ficheiros"} ${names} ${tooBig.length === 1 ? "excede" : "excedem"} o máximo de ${MAX_FILE_BYTES / MEGABYTE} MB.`;
  }
  const empty = files.find((file) => file.size === 0);
  if (empty) return `O ficheiro ${empty.name} está vazio.`;
  const longName = files.find((file) => file.name.length > MAX_FILE_NAME_LENGTH);
  if (longName) return `O nome do ficheiro tem de ter no máximo ${MAX_FILE_NAME_LENGTH} caracteres.`;
  return undefined;
}

/** Erro da data de validade (opcional). */
export function expiryDateError(expiryDate: string | undefined): string | undefined {
  if (!expiryDate) return undefined;
  return isValidIsoDate(expiryDate) ? undefined : "Data de validade inválida.";
}

/** Tipos de documento que são fotografias e pedem a fase (Antes, Durante, Depois). */
export const PHOTO_DOCUMENT_TYPES = ["Fotografia de obra"];

export function isPhotoType(type: string): boolean {
  return PHOTO_DOCUMENT_TYPES.includes(type);
}

/** Erro da fase de uma fotografia: obrigatória nas fotografias, proibida nos outros tipos. */
export function photoStageError(type: string, photoStage: string | undefined): string | undefined {
  if (!isPhotoType(type)) return photoStage ? "Só as fotografias têm fase." : undefined;
  if (!photoStage) return "Escolha a fase da fotografia.";
  return (PHOTO_STAGES as readonly string[]).includes(photoStage) ? undefined : "Fase inválida.";
}

/** Erro do tipo escolhido para esta entidade. */
export function documentTypeError(kind: DocumentOwnerKind, type: string): string | undefined {
  if (!type) return "Escolha o tipo de documento.";
  return documentTypesFor(kind).includes(type) ? undefined : "Tipo de documento inválido.";
}
