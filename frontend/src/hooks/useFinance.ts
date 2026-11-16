import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { ApiError } from "../api/client";
import {
  createFinancing,
  createMovement,
  getFinancings,
  getMovement,
  getMovementOptions,
  getMovements,
  markMovementDone,
  updateMovement,
  type FinancingInput,
  type Movement,
  type MovementFilters,
  type MovementInput,
} from "../api/financeApi";

const movementsKey = ["movements"] as const;
const movementKey = (id: number) => ["movement", id] as const;
const optionsKey = ["movementOptions"] as const;
const financingsKey = ["financings"] as const;

/** Detalhe (tarefas 04–06) onde um movimento também aparece, pela entidade associada. */
const linkedDetailKey = {
  operation: "operation",
  investment: "investment",
  budgetItem: "work",
  financing: "financing",
} as const;

/**
 * Depois de gravar um movimento: listas, totais, o próprio detalhe, o que fica disponível
 * nos itens de orçamento e financiamentos, e as operações, obras e investimentos afetados.
 */
function refresh(client: QueryClient, movement: Movement, previous?: Movement) {
  client.setQueryData(movementKey(movement.id), movement);
  const affected = [movement.link, previous?.link].flatMap((link) =>
    link ? [[linkedDetailKey[link.kind], link.kind === "budgetItem" ? link.parentId : link.id]] : [],
  );
  return Promise.all([
    client.invalidateQueries({ queryKey: movementsKey }),
    client.invalidateQueries({ queryKey: optionsKey }),
    client.invalidateQueries({ queryKey: financingsKey }),
    client.invalidateQueries({ queryKey: ["operations"] }),
    client.invalidateQueries({ queryKey: ["works"] }),
    client.invalidateQueries({ queryKey: ["investments"] }),
    client.invalidateQueries({ queryKey: ["documentOwners", "movement"] }),
    ...affected.map((queryKey) => client.invalidateQueries({ queryKey })),
  ]);
}

export function useMovements(filters: MovementFilters = {}) {
  return useQuery({ queryKey: [...movementsKey, filters], queryFn: () => getMovements(filters), placeholderData: keepPreviousData });
}

export function useMovement(id: number) {
  return useQuery({
    queryKey: movementKey(id),
    queryFn: () => getMovement(id),
    retry: (failures, error) => !(error instanceof ApiError && error.status === 404) && failures < 3,
  });
}

export function useMovementOptions() {
  return useQuery({ queryKey: optionsKey, queryFn: getMovementOptions });
}

export function useCreateMovement() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: MovementInput) => createMovement(input),
    onSuccess: (movement) => refresh(client, movement),
  });
}

export function useUpdateMovement(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: MovementInput) => updateMovement(id, input),
    // Guarda o movimento antes da alteração para também atualizar a entidade a que deixou de estar associado.
    onMutate: () => ({ previous: client.getQueryData<Movement>(movementKey(id)) }),
    onSuccess: (movement, _input, context) => refresh(client, movement, context?.previous),
  });
}

export function useMarkMovementDone(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (effectiveDate: string) => markMovementDone(id, effectiveDate),
    onSuccess: (movement) => refresh(client, movement),
  });
}

export function useFinancings() {
  return useQuery({ queryKey: financingsKey, queryFn: getFinancings });
}

export function useCreateFinancing() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: FinancingInput) => createFinancing(input),
    onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: financingsKey }), client.invalidateQueries({ queryKey: optionsKey })]),
  });
}
