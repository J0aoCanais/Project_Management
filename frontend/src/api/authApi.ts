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

/** Sem sessão, `apiFetch` manda para /login e volta a esta página depois de entrar. */
export async function getSession(): Promise<Session> {
  const body = await apiFetch<ApiSession>("/me");
  return { id: body.id, email: body.email, accessLevel: body.access_level };
}
