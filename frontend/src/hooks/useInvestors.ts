import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { ApiError } from "../api/client";
import {
  createInvestment,
  createInvestor,
  getInvestor,
  listInvestors,
  updateInvestorProfile,
  type InvestmentInput,
  type InvestorDetail,
  type InvestorProfile,
  type NewInvestorInput,
} from "../api/investorsApi";

const listKey = ["investors"] as const;
const detailKey = (id: number) => ["investor", id] as const;

/** Guarda o detalhe devolvido pelo servidor e atualiza a lista. */
function storeDetail(client: QueryClient, detail: InvestorDetail) {
  client.setQueryData(detailKey(detail.id), detail);
  return client.invalidateQueries({ queryKey: listKey });
}

export function useInvestors() {
  return useQuery({ queryKey: listKey, queryFn: listInvestors });
}

export function useInvestor(id: number) {
  return useQuery({
    queryKey: detailKey(id),
    queryFn: () => getInvestor(id),
    enabled: Number.isFinite(id),
    retry: (failures, error) => !(error instanceof ApiError && error.status === 404) && failures < 3,
  });
}

export function useCreateInvestor() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: NewInvestorInput) => createInvestor(input),
    onSuccess: (detail) => {
      // O contacto passou a investidor (ou foi criado): sai da lista de contactos.
      void client.invalidateQueries({ queryKey: ["contacts"] });
      void client.invalidateQueries({ queryKey: ["contact", detail.id] });
      return storeDetail(client, detail);
    },
  });
}

export function useUpdateInvestor(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (profile: InvestorProfile) => updateInvestorProfile(id, profile),
    onSuccess: (detail) => storeDetail(client, detail),
  });
}

export function useCreateInvestment(investorId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: InvestmentInput) => createInvestment(investorId, input),
    onSuccess: (detail) => storeDetail(client, detail),
  });
}
