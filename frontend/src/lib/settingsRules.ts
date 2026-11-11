import type { NewUser, MovementCategoryInput } from "../api/settingsApi";
import { movementDirections } from "../temp";

export const SETTINGS_LIMITS = {
  username: 40,
  email: 120,
  password: 128,
  leadSourceName: 40,
  movementCategoryName: 60,
} as const;

export function usernameError(username: string): string | undefined {
  if (username.length < 3) return "Use pelo menos 3 caracteres.";
  if (username.length > SETTINGS_LIMITS.username) return `Máximo de ${SETTINGS_LIMITS.username} caracteres.`;
  if (/\s/.test(username)) return "Não pode conter espaços.";
  return undefined;
}

export function emailError(email: string): string | undefined {
  if (email.length > SETTINGS_LIMITS.email) return `Máximo de ${SETTINGS_LIMITS.email} caracteres.`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Indique um email válido.";
  return undefined;
}

export function passwordError(password: string, currentPassword?: string): string | undefined {
  if (password.length < 10) return "A palavra-passe deve ter pelo menos 10 caracteres.";
  if (password.length > SETTINGS_LIMITS.password) return `Máximo de ${SETTINGS_LIMITS.password} caracteres.`;
  if (!/[A-Za-zÀ-ÿ]/.test(password) || !/\d/.test(password)) return "Inclua pelo menos uma letra e um número.";
  if (currentPassword !== undefined && password === currentPassword) return "A nova palavra-passe tem de ser diferente da atual.";
  return undefined;
}

export function newUserErrors(input: NewUser) {
  return {
    username: usernameError(input.username),
    email: emailError(input.email),
    accessLevel: input.accessLevel ? undefined : "Escolha o nível de acesso.",
    password: passwordError(input.password),
  };
}

export function leadSourceNameError(name: string): string | undefined {
  const value = name.trim();
  if (value.length < 2) return "Use pelo menos 2 caracteres.";
  if (value.length > SETTINGS_LIMITS.leadSourceName) return `Máximo de ${SETTINGS_LIMITS.leadSourceName} caracteres.`;
  return undefined;
}

export function movementCategoryErrors(input: MovementCategoryInput) {
  const name = input.name.trim();
  return {
    name: name.length < 2 ? "Use pelo menos 2 caracteres." : name.length > SETTINGS_LIMITS.movementCategoryName ? `Máximo de ${SETTINGS_LIMITS.movementCategoryName} caracteres.` : undefined,
    direction: movementDirections.includes(input.direction) ? undefined : "Escolha a direção.",
  };
}

export function maxDaysError(days: number): string | undefined {
  if (!Number.isInteger(days) || days < 1 || days > 365) return "Indique um número inteiro entre 1 e 365.";
  return undefined;
}
