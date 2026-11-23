import { apiFetch } from "./client";

/** Utilizador da sessão, devolvido por GET /api/me (app/auth/routes.py). */
export interface Session {
  id: number;
  email: string;
  accessLevel: string;
}

interface ApiSession {
  id: number;
  email: string;
  access_level: string;
}

const fromApi = (body: ApiSession): Session => ({ id: body.id, email: body.email, accessLevel: body.access_level });

/** Sem sessão, `apiFetch` manda para /login e volta a esta página depois de entrar. */
export async function getSession(): Promise<Session> {
  return fromApi(await apiFetch<ApiSession>("/me"));
}

export interface Credentials {
  username: string;
  password: string;
}

/** POST /api/auth/login. Credenciais erradas → ApiError 401 com a mensagem do servidor (sem redirecionar). */
export async function login(credentials: Credentials): Promise<Session> {
  return fromApi(await apiFetch<ApiSession>("/auth/login", { method: "POST", body: JSON.stringify(credentials) }, { loginRedirect: false }));
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/auth/logout", { method: "POST" });
}
