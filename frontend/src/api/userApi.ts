import { currentUserFixture } from "./fixtures/currentUser";

export interface CurrentUser {
  id: number;
  name: string;
  role: string;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  // TODO: trocar pelo endpoint quando existir, ex.: return apiFetch<CurrentUser>("/v1/me");
  return currentUserFixture;
}
