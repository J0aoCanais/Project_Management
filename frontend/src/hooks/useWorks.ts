import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createWork,
  deleteBudgetItem,
  getWork,
  getWorkOptions,
  getWorks,
  getWorkStats,
  markWorkCompleted,
  saveBudgetItem,
  updateWork,
  uploadWorkDocuments,
  type BudgetItem,
  type NewWorkInput,
  type UpdateWorkInput,
  type WorkFilterParams,
} from "../api/worksApi";
import type { PhotoStage } from "../lib/workRules";

export function useWorks(filters?: WorkFilterParams) {
  return useQuery({
    queryKey: ["works", filters],
    queryFn: () => getWorks(filters),
    placeholderData: keepPreviousData,
  });
}

export function useWork(id: number) {
  return useQuery({
    queryKey: ["work", id],
    queryFn: () => getWork(id),
    enabled: !Number.isNaN(id) && id > 0,
  });
}

export function useWorkStats() {
  return useQuery({
    queryKey: ["works", "stats"],
    queryFn: getWorkStats,
  });
}

export function useWorkOptions() {
  return useQuery({
    queryKey: ["works", "options"],
    queryFn: getWorkOptions,
  });
}

export function useCreateWork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewWorkInput) => createWork(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["works"] });
    },
  });
}

export function useUpdateWork(id?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id: workId, input }: { id: number; input: UpdateWorkInput }) => updateWork(workId, input),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["works"] });
      void queryClient.invalidateQueries({ queryKey: ["work", variables.id] });
      if (id) void queryClient.invalidateQueries({ queryKey: ["work", id] });
    },
  });
}

export function useMarkWorkCompleted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markWorkCompleted(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ["works"] });
      void queryClient.invalidateQueries({ queryKey: ["work", id] });
    },
  });
}

export function useSaveBudgetItem(workId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: Omit<BudgetItem, "id"> & { id?: string }) => saveBudgetItem(workId, item),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["works"] });
      void queryClient.invalidateQueries({ queryKey: ["work", workId] });
    },
  });
}

export function useDeleteBudgetItem(workId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteBudgetItem(workId, itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["works"] });
      void queryClient.invalidateQueries({ queryKey: ["work", workId] });
    },
  });
}

export function useUploadWorkDocuments(workId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ files, type, photoStage }: { files: File[]; type: string; photoStage?: PhotoStage }) =>
      uploadWorkDocuments(workId, files, type, photoStage),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["work", workId] });
    },
  });
}
