import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { deleteDocument, getDocumentOwners, getDocuments, uploadDocuments, type DocumentFilters, type DocumentOwner, type DocumentOwnerKind, type UploadDocumentsInput } from "../api/documentsApi";

const listKey = ["documents"] as const;

/** Chave do detalhe do dono, para mostrar a atividade e os avisos atualizados. */
const ownerDetailKey: Record<DocumentOwnerKind, string> = {
  opportunity: "opportunity",
  property: "property",
  operation: "operation",
  work: "work",
  investment: "investment",
  movement: "movement",
};

function refresh(client: QueryClient, owner: DocumentOwner) {
  return Promise.all([
    client.invalidateQueries({ queryKey: listKey }),
    client.invalidateQueries({ queryKey: [ownerDetailKey[owner.kind], owner.id] }),
  ]);
}

export function useDocuments(filters: DocumentFilters = {}) {
  return useQuery({ queryKey: [...listKey, filters], queryFn: () => getDocuments(filters), placeholderData: keepPreviousData });
}

export function useDocumentOwners(kind: DocumentOwnerKind | undefined) {
  return useQuery({
    queryKey: ["documentOwners", kind],
    queryFn: () => getDocumentOwners(kind!),
    enabled: kind !== undefined,
  });
}

export function useUploadDocuments() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadDocumentsInput) => uploadDocuments(input),
    onSuccess: (_documents, input) => refresh(client, input.owner),
  });
}

export function useDeleteDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; owner: DocumentOwner }) => deleteDocument(id),
    onSuccess: (_result, { owner }) => refresh(client, owner),
  });
}
