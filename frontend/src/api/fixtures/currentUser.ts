import type { CurrentUser } from "../userApi";

// TODO: trocar pelo endpoint quando existir (utilizador autenticado).
export const currentUserFixture: CurrentUser = {
  id: 1,
  name: "Rodrigo Mendes",
  role: "Administrador",
};
