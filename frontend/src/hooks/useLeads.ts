import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addLeadContact, convertLead, createLead, getLead, importLeads, listLeads, updateLeadStatus, type LeadStatus, type NewLeadInput, type LeadContactEntry } from "../api/leadsApi";
import { getLeadSources } from "../api/settingsApi";

export function useLeads() {
  return useQuery({ queryKey: ["leads"], queryFn: listLeads });
}

export function useLead(id: number) {
  return useQuery({ queryKey: ["lead", id], queryFn: () => getLead(id), enabled: Number.isFinite(id) });
}

export function useLeadSources() {
  return useQuery({
    queryKey: ["lead-sources"],
    queryFn: async () => (await getLeadSources()).filter((source) => source.isActive).map((source) => source.name),
  });
}

function useLeadMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>, id?: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["leads"] });
      if (id !== undefined) void client.invalidateQueries({ queryKey: ["lead", id] });
    },
  });
}

export function useCreateLead() {
  return useLeadMutation((input: NewLeadInput) => createLead(input));
}

export function useUpdateLeadStatus(id: number) {
  return useLeadMutation(({ status, discardReason }: { status: LeadStatus; discardReason?: string }) => updateLeadStatus(id, status, discardReason), id);
}

export function useAddLeadContact(id: number) {
  return useLeadMutation((entry: Omit<LeadContactEntry, "id">) => addLeadContact(id, entry), id);
}

export function useImportLeads() {
  return useLeadMutation((rows: NewLeadInput[]) => importLeads(rows));
}

export function useConvertLead(id: number) {
  return useLeadMutation(() => convertLead(id), id);
}
