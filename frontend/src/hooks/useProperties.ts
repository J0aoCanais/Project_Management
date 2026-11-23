import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { ApiError } from "../api/client";
import { createProperty, getProperties, getProperty, updateProperty, type PropertyDetail, type PropertyInput } from "../api/propertiesApi";

const listKey = ["properties"] as const;
const detailKey = (id: number) => ["property", id] as const;

function storeDetail(client: QueryClient, detail: PropertyDetail) {
  client.setQueryData(detailKey(detail.id), detail);
  return Promise.all([client.invalidateQueries({ queryKey: listKey }), client.invalidateQueries({ queryKey: ["documentOwners", "property"] })]);
}

export function useProperties() {
  return useQuery({ queryKey: listKey, queryFn: getProperties });
}

export function useProperty(id: number) {
  return useQuery({
    queryKey: detailKey(id),
    queryFn: () => getProperty(id),
    // Um registo que não existe não passa a existir por tentar de novo.
    retry: (failures, error) => !(error instanceof ApiError && error.status === 404) && failures < 3,
  });
}

export function useCreateProperty() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: PropertyInput) => createProperty(input),
    onSuccess: (detail) => storeDetail(client, detail),
  });
}

export function useUpdateProperty(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: PropertyInput) => updateProperty(id, input),
    onSuccess: (detail) => storeDetail(client, detail),
  });
}
