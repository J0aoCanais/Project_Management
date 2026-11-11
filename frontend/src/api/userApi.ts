import { getCurrentUserRecord } from "./fixtures/settingsStore";

export interface CurrentUser {
  id: number;
  name: string;
  role: string;
  email: string;
  lastLogin: string;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  // TODO: trocar pelo endpoint quando existir, ex.: return apiFetch<CurrentUser>("/v1/me");
  return getCurrentUserRecord();
}
