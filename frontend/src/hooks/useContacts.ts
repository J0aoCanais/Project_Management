import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "../api/client";
import {
  createContact,
  deleteContact,
  getContact,
  importContacts,
  listContactRoles,
  listContactTypes,
  listContacts,
  searchContacts,
  updateContact,
  OTHER_TYPE,
  type ContactInput,
  type ContactSearch,
} from "../api/contactsApi";

const listKey = ["contacts"] as const;
const detailKey = (id: number) => ["contact", id] as const;

/** Um registo que não existe não passa a existir por tentar de novo. */
const retryUnlessMissing = (failures: number, error: Error) => !(error instanceof ApiError && error.status === 404) && failures < 3;

/** Todos os contactos (lê as páginas todas). `enabled` evita o pedido enquanto não é preciso. */
export function useContacts(enabled = true) {
  return useQuery({ queryKey: [...listKey, "all"], queryFn: listContacts, enabled });
}

/** Uma página da lista, filtrada e paginada no backend. Mantém a página anterior enquanto a nova carrega. */
export function useContactSearch(search: ContactSearch) {
  return useQuery({ queryKey: [...listKey, "search", search], queryFn: () => searchContacts(search), placeholderData: keepPreviousData });
}

/** Nomes dos papéis para o filtro por tipo. */
export function useContactRoleNames(): string[] {
  const query = useQuery({ queryKey: ["contact-roles"], queryFn: listContactRoles, staleTime: 5 * 60_000 });
  return (query.data ?? []).map((role) => role.name);
}

export function useContact(id: number) {
  return useQuery({ queryKey: detailKey(id), queryFn: () => getContact(id), enabled: Number.isFinite(id), retry: retryUnlessMissing });
}

/** Tipos de contacto (papéis em GET /api/contacts/roles). Enquanto carregam, só há "Outro". */
export function useContactTypes(): string[] {
  const query = useQuery({ queryKey: ["contact-types"], queryFn: listContactTypes, staleTime: 5 * 60_000 });
  return query.data ?? [OTHER_TYPE];
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
