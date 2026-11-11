import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { ApiError } from "../api/client";
import {
  cancelOperation,
  createOperation,
  getOperation,
  getOperationOptions,
  getOperations,
  moveOperationPhase,
  uploadOperationDocuments,
  type NewOperation,
  type OperationCard,
  type OperationDetail,
} from "../api/operationsApi";

const listKey = ["operations"] as const;
const detailKey = (id: number) => ["operation", id] as const;

function storeDetail(client: QueryClient, detail: OperationDetail) {
  client.setQueryData(detailKey(detail.id), detail);
  return client.invalidateQueries({ queryKey: listKey });
}

export function useOperations() {
  return useQuery({ queryKey: listKey, queryFn: getOperations });
}

export function useOperation(id: number) {
  return useQuery({
    queryKey: detailKey(id),
    queryFn: () => getOperation(id),
    retry: (failures, error) => !(error instanceof ApiError && error.status === 404) && failures < 3,
  });
}

export function useOperationOptions() {
  return useQuery({ queryKey: ["operationOptions"], queryFn: getOperationOptions, staleTime: 60_000 });
}

export function useCreateOperation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: NewOperation) => createOperation(input),
    onSuccess: (detail) => {
      client.setQueryData(detailKey(detail.id), detail);
      return Promise.all([
        client.invalidateQueries({ queryKey: listKey }),
        client.invalidateQueries({ queryKey: ["operationOptions"] }),
        client.invalidateQueries({ queryKey: ["opportunities"] }),
        client.invalidateQueries({ queryKey: ["opportunity", detail.opportunityId] }),
      ]);
    },
  });
}

export function useMoveOperationPhase() {
  const client = useQueryClient();
  const patch = (id: number, changes: Pick<OperationCard, "phaseIndex" | "daysInPhase">) => {
    client.setQueryData<OperationCard[]>(listKey, (cards) => cards?.map((card) => (card.id === id ? { ...card, ...changes } : card)));
    client.setQueryData<OperationDetail>(detailKey(id), (detail) => detail && { ...detail, ...changes });
  };

  return useMutation({
    mutationFn: ({ id, phaseIndex }: { id: number; phaseIndex: number }) => moveOperationPhase(id, phaseIndex),
    onMutate: async ({ id, phaseIndex }) => {
      await Promise.all([client.cancelQueries({ queryKey: listKey }), client.cancelQueries({ queryKey: detailKey(id) })]);
      const previous =
        client.getQueryData<OperationCard[]>(listKey)?.find((card) => card.id === id) ??
        client.getQueryData<OperationDetail>(detailKey(id));
      patch(id, { phaseIndex, daysInPhase: 0 });
      return { previous };
    },
    onError: (_error, { id }, context) => {
      if (context?.previous) patch(id, { phaseIndex: context.previous.phaseIndex, daysInPhase: context.previous.daysInPhase });
    },
    onSettled: (_data, _error, { id }) =>
      Promise.all([client.invalidateQueries({ queryKey: listKey }), client.invalidateQueries({ queryKey: detailKey(id) })]),
  });
}

export function useCancelOperation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => cancelOperation(id, reason),
    onSuccess: (detail) => storeDetail(client, detail),
  });
}

export function useUploadOperationDocuments() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, files, type }: { id: number; files: File[]; type: string }) => uploadOperationDocuments(id, files, type),
    onSuccess: (detail) => storeDetail(client, detail),
  });
}
