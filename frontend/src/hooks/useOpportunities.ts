import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { ApiError } from "../api/client";
import {
  convertOpportunity,
  createOpportunity,
  getOpportunities,
  getOpportunity,
  getOpportunityOptions,
  moveOpportunityPhase,
  rejectOpportunity,
  saveOpportunityFinance,
  uploadOpportunityDocuments,
  type ExtraCost,
  type FinanceValues,
  type NewOpportunity,
  type OpportunityCard,
  type OpportunityDetail,
} from "../api/opportunitiesApi";

const listKey = ["opportunities"] as const;
const detailKey = (id: number) => ["opportunity", id] as const;

/** Guarda o detalhe devolvido pelo servidor e atualiza o quadro. */
function storeDetail(client: QueryClient, detail: OpportunityDetail) {
  client.setQueryData(detailKey(detail.id), detail);
  return client.invalidateQueries({ queryKey: listKey });
}

export function useOpportunities() {
  return useQuery({ queryKey: listKey, queryFn: getOpportunities });
}

export function useOpportunity(id: number) {
  return useQuery({
    queryKey: detailKey(id),
    queryFn: () => getOpportunity(id),
    // Um registo que não existe não passa a existir por tentar de novo.
    retry: (failures, error) => !(error instanceof ApiError && error.status === 404) && failures < 3,
  });
}

export function useOpportunityOptions() {
  return useQuery({ queryKey: ["opportunityOptions"], queryFn: getOpportunityOptions, staleTime: 5 * 60 * 1000 });
}

export function useCreateOpportunity() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: NewOpportunity) => createOpportunity(input),
    onSuccess: (detail) => storeDetail(client, detail),
  });
}

/** Muda de fase de imediato; se o servidor falhar, repõe a fase anterior só deste registo. */
export function useMoveOpportunityPhase() {
  const client = useQueryClient();

  const patch = (id: number, changes: Pick<OpportunityCard, "phaseIndex" | "daysInPhase">) => {
    client.setQueryData<OpportunityCard[]>(listKey, (cards) => cards?.map((card) => (card.id === id ? { ...card, ...changes } : card)));
    client.setQueryData<OpportunityDetail>(detailKey(id), (detail) => detail && { ...detail, ...changes });
  };

  return useMutation({
    mutationFn: ({ id, phaseIndex }: { id: number; phaseIndex: number }) => moveOpportunityPhase(id, phaseIndex),
    onMutate: async ({ id, phaseIndex }) => {
      await Promise.all([client.cancelQueries({ queryKey: listKey }), client.cancelQueries({ queryKey: detailKey(id) })]);
      const previous =
        client.getQueryData<OpportunityCard[]>(listKey)?.find((card) => card.id === id) ??
        client.getQueryData<OpportunityDetail>(detailKey(id));
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

export function useSaveFinance() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, finance, extraCosts }: { id: number; finance: FinanceValues; extraCosts: ExtraCost[] }) =>
      saveOpportunityFinance(id, finance, extraCosts),
    onSuccess: (detail) => storeDetail(client, detail),
  });
}

export function useUploadOpportunityDocuments() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, files, type }: { id: number; files: File[]; type: string }) => uploadOpportunityDocuments(id, files, type),
    onSuccess: (detail) => storeDetail(client, detail),
  });
}

export function useRejectOpportunity() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectOpportunity(id, reason),
    onSuccess: (detail) => storeDetail(client, detail),
  });
}

export function useConvertOpportunity() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => convertOpportunity(id),
    onSuccess: (result, id) =>
      Promise.all([
        client.invalidateQueries({ queryKey: listKey }),
        client.invalidateQueries({ queryKey: detailKey(id) }),
        client.invalidateQueries({ queryKey: ["operations"] }),
        client.invalidateQueries({ queryKey: ["operationOptions"] }),
        client.invalidateQueries({ queryKey: ["operation", result.operationId] }),
      ]),
  });
}
