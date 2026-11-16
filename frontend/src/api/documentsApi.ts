import * as store from "./fixtures/documentsStore";

/** Entidade a que um documento pertence. Cada documento tem um só dono (`Document` em app/models.py). */
export type DocumentOwnerKind = "opportunity" | "operation" | "work" | "investment" | "movement" | "property";

export interface DocumentOwner {
  kind: DocumentOwnerKind;
  id: number;
}

/** Registo que pode ser dono de documentos, para escolher numa lista. */
export interface OwnerRef {
  id: number;
  label: string;
  /** Registo onde se vê esta entidade, quando não tem página própria (ver `entityPath`). */
  parentId?: number;
}

export interface DocumentRecord {
  id: number;
  name: string;
  type: string;
  /** Extensão em maiúsculas: "PDF", "XLSX"… */
  fileType: string;
  sizeBytes: number;
  /** Hash simulado; o ficheiro não é guardado. */
  fileHash: string;
  uploadedAt: string;
  /** "aaaa-mm-dd" */
  expiryDate?: string;
  owner: DocumentOwner & Omit<OwnerRef, "id">;
}

export interface DocumentFilters {
  q?: string;
  type?: string;
  ownerKind?: DocumentOwnerKind;
  ownerId?: number;
}

export interface UploadDocumentsInput {
  owner: DocumentOwner;
  type: string;
  expiryDate?: string;
  files: File[];
}

// TODO: trocar pelo endpoint quando existir. Cada função indica o pedido previsto.

export async function getDocuments(filters: DocumentFilters = {}): Promise<DocumentRecord[]> {
  // apiFetch<DocumentRecord[]>(`/v1/documents?${params}`)
  return store.listDocuments(filters);
}

export async function getDocumentOwners(kind: DocumentOwnerKind): Promise<OwnerRef[]> {
  // GET /v1/{opportunities|operations|…}?fields=id,name
  return store.listOwners(kind);
}

export async function uploadDocuments(input: UploadDocumentsInput): Promise<DocumentRecord[]> {
  // POST /v1/documents (multipart)
  return store.addDocuments(input);
}

export async function deleteDocument(id: number): Promise<void> {
  // DELETE /v1/documents/${id}
  return store.removeDocument(id);
}
