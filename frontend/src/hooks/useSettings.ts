import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  changePassword,
  createUser,
  getLeadSources,
  getMovementCategories,
  getPhases,
  getRoles,
  getUsers,
  saveLeadSource,
  saveMovementCategory,
  updatePhase,
  updateUser,
  type LeadSourceInput,
  type MovementCategoryInput,
  type NewUser,
  type UserUpdate,
} from "../api/settingsApi";

const userKey = ["settings", "users"] as const;
const leadSourcesKey = ["settings", "lead-sources"] as const;
const phasesKey = ["settings", "phases"] as const;
const categoriesKey = ["settings", "movement-categories"] as const;

export function useUsers() {
  return useQuery({ queryKey: userKey, queryFn: getUsers });
}

export function useRoles() {
  return useQuery({ queryKey: ["settings", "roles"], queryFn: getRoles, staleTime: 5 * 60 * 1000 });
}

export function useCreateUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: NewUser) => createUser(input),
    onSuccess: () => client.invalidateQueries({ queryKey: userKey }),
  });
}

export function useUpdateUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UserUpdate }) => updateUser(id, input),
    onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: userKey }), client.invalidateQueries({ queryKey: ["currentUser"] })]),
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}

export function useLeadSourcesAdmin() {
  return useQuery({ queryKey: leadSourcesKey, queryFn: getLeadSources });
}

export function useSaveLeadSource() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: number; input: LeadSourceInput }) => saveLeadSource(id, input),
    onSuccess: () => Promise.all([
      client.invalidateQueries({ queryKey: leadSourcesKey }),
      client.invalidateQueries({ queryKey: ["lead-sources"] }),
    ]),
  });
}

export function usePhases() {
  return useQuery({ queryKey: phasesKey, queryFn: getPhases });
}

export function useUpdatePhase() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, maxDaysStalled }: { id: number; maxDaysStalled: number }) => updatePhase(id, maxDaysStalled),
    onSuccess: () => client.invalidateQueries({ queryKey: phasesKey }),
  });
}

export function useMovementCategories() {
  return useQuery({ queryKey: categoriesKey, queryFn: getMovementCategories });
}

export function useSaveMovementCategory() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: MovementCategoryInput) => saveMovementCategory(input),
    onSuccess: () => client.invalidateQueries({ queryKey: categoriesKey }),
  });
}
