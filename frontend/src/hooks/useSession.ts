import { useMutation, useQuery } from "@tanstack/react-query";

import { getSession, login, logout, type Credentials } from "../api/authApi";

export function useSession() {
  return useQuery({ queryKey: ["session"], queryFn: getSession, staleTime: Infinity, retry: false });
}

export function useLogin() {
  return useMutation({ mutationFn: (credentials: Credentials) => login(credentials) });
}

/** Depois de sair recarrega-se a aplicação na página de login, para não ficar nada da sessão em memória. */
export function useLogout() {
  return useMutation({ mutationFn: logout, onSettled: () => window.location.assign("/login") });
}
