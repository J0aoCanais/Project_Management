import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "../api/client";
import {
  createContact,
  deleteContact,
  getContact,
  getContactOperations,
  importContacts,
  listContacts,
  updateContact,
  type ContactInput,
} from "../api/contactsApi";

const listKey = ["contacts"] as const;
const detailKey = (id: number) => ["contact", id] as const;

/** Um registo que não existe não passa a existir por tentar de novo. */
const retryUnlessMissing = (failures: number, error: Error) => !(error instanceof ApiError && error.status === 404) && failures < 3;

export function useContacts() {
  return useQuery({ queryKey: listKey, queryFn: listContacts });
}

export function useContact(id: number) {
  return useQuery({ queryKey: detailKey(id), queryFn: () => getContact(id), enabled: Number.isFinite(id), retry: retryUnlessMissing });
}

export function useContactOperations(id: number) {
  return useQuery({ queryKey: ["contact-operations", id], queryFn: () => getContactOperations(id), enabled: Number.isFinite(id) });
}

function useContactMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>, id?: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: listKey });
      if (id !== undefined) void client.invalidateQueries({ queryKey: detailKey(id) });
    },
  });
}

export function useCreateContact() {
  return useContactMutation((input: ContactInput) => createContact(input));
}

export function useUpdateContact(id: number) {
  return useContactMutation((changes: Partial<ContactInput>) => updateContact(id, changes), id);
}

export function useDeleteContact(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => deleteContact(id),
    onSuccess: () => {
      client.removeQueries({ queryKey: detailKey(id) });
      void client.invalidateQueries({ queryKey: listKey });
    },
  });
}

export function useImportContacts() {
  return useContactMutation((rows: ContactInput[]) => importContacts(rows));
}
