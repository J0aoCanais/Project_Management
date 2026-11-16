import { documentTypeError, expiryDateError, filesError, photoStageError } from "../../lib/documentRules";
import { ApiError } from "../client";
import type { DocumentFilters, DocumentOwner, DocumentOwnerKind, DocumentRecord, OwnerRef, UploadDocumentsInput } from "../documentsApi";
import { documentsFixture, investorsFixture, movementCategoriesFixture, movementsFixture, operationsFixture, opportunitiesFixture, propertiesFixture, worksFixture } from "../../temp";
import { recordActivity as recordOperationActivity } from "./operationsStore";
import { recordActivity } from "./opportunitiesStore";
import { respond } from "./respond";

// TODO: trocar pelo endpoint quando existir. Simula o servidor: as alterações ficam em memória até recarregar a página.

/** Registos que podem ter documentos, com o nome a mostrar. */
function owners(kind: DocumentOwnerKind): OwnerRef[] {
  switch (kind) {
    case "opportunity":
      return opportunitiesFixture.filter((item) => !item.rejection).map((item) => ({ id: item.id, label: item.title }));
    case "property":
      return propertiesFixture.map((item) => ({ id: item.id, label: `${item.code} · ${item.address}` }));
    case "operation":
      return operationsFixture.filter((item) => !item.cancellation).map((item) => ({ id: item.id, label: `${item.code} · ${item.zone}` }));
    case "work":
      return worksFixture.map((item) => ({ id: item.id, label: `${item.name} · ${item.operationCode}` }));
    case "investment":
      return investorsFixture.flatMap((investor) => investor.investments.map((item) => ({ id: item.id, label: `${investor.name} · ${item.operationCode}`, parentId: investor.id })));
    case "movement":
      return movementsFixture.map((item) => {
        const category = movementCategoriesFixture.find((entry) => entry.id === item.categoryId)?.name ?? "Movimento";
        return { id: item.id, label: item.notes ? `${category} · ${item.notes}` : category };
      });
  }
}

function findOwner(owner: DocumentOwner): OwnerRef | undefined {
  return owners(owner.kind).find((item) => item.id === owner.id);
}

function withOwner(document: (typeof documentsFixture)[number]): DocumentRecord {
  const ref = findOwner(document.owner);
  return { ...document, owner: { ...document.owner, label: ref?.label ?? "Registo removido", parentId: ref?.parentId } };
}

const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function listDocuments(filters: DocumentFilters) {
  const term = normalize(filters.q?.trim() ?? "");
  const rows = documentsFixture
    .filter(
      (document) =>
        (!term || normalize(document.name).includes(term)) &&
        (!filters.type || document.type === filters.type) &&
        (!filters.ownerKind || document.owner.kind === filters.ownerKind) &&
        (filters.ownerId === undefined || document.owner.id === filters.ownerId),
    )
    .map(withOwner)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  return respond(rows);
}

export function listOwners(kind: DocumentOwnerKind) {
  return respond(owners(kind));
}

let nextDocumentId = Math.max(0, ...documentsFixture.map((document) => document.id)) + 1;

/** Hash simulado: o ficheiro não é guardado, só o nome, o tipo e o tamanho. */
function fakeHash(file: File): string {
  let hash = 0;
  for (const char of `${file.name}:${file.size}:${file.lastModified}`) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `sha256-simulado-${hash.toString(16).padStart(8, "0")}`;
}

export async function addDocuments({ owner, type, expiryDate, photoStage, files }: UploadDocumentsInput) {
  await respond(null);
  // O servidor valida sempre, mesmo que o formulário já o tenha feito.
  if (!findOwner(owner)) throw new ApiError(422, "Escolha o registo a que o documento pertence.");
  const invalid = filesError(files) ?? documentTypeError(owner.kind, type) ?? photoStageError(type, photoStage) ?? expiryDateError(expiryDate);
  if (invalid) throw new ApiError(422, invalid);

  const now = new Date().toISOString();
  const created = files.map((file) => ({
    id: nextDocumentId++,
    name: file.name,
    type,
    fileType: (file.name.includes(".") ? file.name.split(".").pop() ?? "" : "").toUpperCase(),
    sizeBytes: file.size,
    fileHash: fakeHash(file),
    uploadedAt: now,
    expiryDate: expiryDate || undefined,
    photoStage: photoStage || undefined,
    owner: { kind: owner.kind, id: owner.id },
  }));
  documentsFixture.push(...created);
  const text = files.length === 1 ? "Documento carregado" : `${files.length} documentos carregados`;
  if (owner.kind === "opportunity") recordActivity(owner.id, text);
  if (owner.kind === "operation") recordOperationActivity(owner.id, text);
  return structuredClone(created.map(withOwner));
}

export async function removeDocument(id: number) {
  await respond(null);
  const index = documentsFixture.findIndex((document) => document.id === id);
  if (index === -1) throw new ApiError(404, "Documento não encontrado");
  const [removed] = documentsFixture.splice(index, 1);
  if (removed.owner.kind === "opportunity") recordActivity(removed.owner.id, `Documento eliminado: ${removed.name}`);
  if (removed.owner.kind === "operation") recordOperationActivity(removed.owner.id, `Documento eliminado: ${removed.name}`);
}
