// Limites do formulário de login. O servidor valida as credenciais; aqui só se evita enviar o que não pode estar certo.

export const LOGIN_LIMITS = {
  username: 120,
  password: 128,
} as const;

export interface LoginErrors {
  username?: string;
  password?: string;
}

export function loginErrors(username: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  if (!username.trim()) errors.username = "Indique o seu email.";
  if (!password) errors.password = "Indique a palavra-passe.";
  return errors;
}

/** Só caminhos da própria aplicação ("/leads"), nunca outro site ("//exemplo.pt", "https://…"). */
export function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\") || next.startsWith("/login")) return "/";
  return next;
}
