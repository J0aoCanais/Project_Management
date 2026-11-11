import {
  leadSourceNameError,
  maxDaysError,
  movementCategoryErrors,
  newUserErrors,
  passwordError,
} from "../../lib/settingsRules";
import {
  currentUserFixture,
  administratorRole,
  movementCategoriesFixture,
  rolesFixture,
  settingsLeadSourcesFixture,
  settingsPhasesFixture,
  settingsUsersFixture,
} from "../../temp";
import { ApiError } from "../client";
import type {
  LeadSource,
  LeadSourceInput,
  MovementCategory,
  MovementCategoryInput,
  NewUser,
  PhaseSetting,
  SettingsUser,
  UserUpdate,
} from "../settingsApi";

const LATENCY_MS = 150;
let nextUserId = Math.max(...settingsUsersFixture.map((user) => user.id)) + 1;
let nextLeadSourceId = Math.max(...settingsLeadSourcesFixture.map((source) => source.id)) + 1;
let nextMovementCategoryId = Math.max(...movementCategoriesFixture.map((category) => category.id)) + 1;

const respond = async <T,>(value: T): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  return structuredClone(value);
};

function findUser(id: number): SettingsUser {
  const user = settingsUsersFixture.find((item) => item.id === id);
  if (!user) throw new ApiError(404, "Utilizador não encontrado");
  return user;
}

export async function listUsers() {
  return respond(settingsUsersFixture);
}

export async function listRoles() {
  return respond(rolesFixture);
}

export async function addUser(input: NewUser) {
  await respond(null);
  const errors = newUserErrors(input);
  if (Object.values(errors).some(Boolean)) throw new ApiError(422, Object.values(errors).find(Boolean) ?? "Dados inválidos");
  if (!rolesFixture.some((role) => role.name === input.accessLevel)) throw new ApiError(422, "Nível de acesso inválido");
  const username = input.username.toLowerCase();
  const email = input.email.toLowerCase();
  if (settingsUsersFixture.some((user) => user.username.toLowerCase() === username || user.email.toLowerCase() === email)) {
    throw new ApiError(409, "Já existe um utilizador com este nome ou email");
  }
  const user: SettingsUser = {
    id: nextUserId++,
    username: input.username,
    email: input.email,
    accessLevel: input.accessLevel,
    lastLogin: "",
    active: true,
  };
  settingsUsersFixture.push(user);
  return structuredClone(user);
}

export async function editUser(id: number, input: UserUpdate) {
  await respond(null);
  const user = findUser(id);
  if (input.accessLevel !== undefined) {
    if (!rolesFixture.some((role) => role.name === input.accessLevel)) throw new ApiError(422, "Nível de acesso inválido");
    const activeAdmins = settingsUsersFixture.filter((item) => item.active && item.accessLevel === administratorRole);
    if (user.active && user.accessLevel === administratorRole && input.accessLevel !== administratorRole && activeAdmins.length <= 1) {
      throw new ApiError(409, "Não é possível remover o último administrador ativo");
    }
    user.accessLevel = input.accessLevel;
  }
  if (input.active !== undefined) {
    if (!input.active && id === currentUserFixture.id) throw new ApiError(409, "Não pode desativar a sua própria conta");
    const activeAdmins = settingsUsersFixture.filter((item) => item.active && item.accessLevel === administratorRole);
    if (!input.active && user.active && user.accessLevel === administratorRole && activeAdmins.length <= 1) {
      throw new ApiError(409, "Não é possível desativar o último administrador ativo");
    }
    user.active = input.active;
  }
  return structuredClone(user);
}

export async function updatePassword(input: { currentPassword: string; newPassword: string }) {
  await respond(null);
  if (!input.currentPassword) throw new ApiError(422, "Indique a palavra-passe atual");
  const error = passwordError(input.newPassword, input.currentPassword);
  if (error) throw new ApiError(422, error);
}

export async function listLeadSources() {
  return respond(settingsLeadSourcesFixture);
}

export async function saveLeadSource(id: number | undefined, input: LeadSourceInput) {
  await respond(null);
  if (id === undefined) {
    const error = leadSourceNameError(input.name ?? "");
    if (error) throw new ApiError(422, error);
    if (settingsLeadSourcesFixture.some((source) => source.name.toLocaleLowerCase() === input.name?.trim().toLocaleLowerCase())) {
      throw new ApiError(409, "Já existe uma origem com esse nome");
    }
    const source: LeadSource = { id: nextLeadSourceId++, name: input.name!.trim(), isActive: true };
    settingsLeadSourcesFixture.push(source);
    return structuredClone(source);
  }
  const source = settingsLeadSourcesFixture.find((item) => item.id === id);
  if (!source) throw new ApiError(404, "Origem de lead não encontrada");
  if (input.isActive !== undefined) source.isActive = input.isActive;
  return structuredClone(source);
}

export async function listPhases() {
  return respond(settingsPhasesFixture);
}

export async function editPhase(id: number, maxDaysStalled: number) {
  await respond(null);
  const phase = settingsPhasesFixture.find((item) => item.id === id);
  if (!phase) throw new ApiError(404, "Fase não encontrada");
  const error = maxDaysError(maxDaysStalled);
  if (error) throw new ApiError(422, error);
  phase.maxDaysStalled = maxDaysStalled;
  return structuredClone(phase);
}

export async function listMovementCategories() {
  return respond(movementCategoriesFixture);
}

export async function addMovementCategory(input: MovementCategoryInput) {
  await respond(null);
  const errors = movementCategoryErrors(input);
  if (Object.values(errors).some(Boolean)) throw new ApiError(422, Object.values(errors).find(Boolean) ?? "Dados inválidos");
  if (movementCategoriesFixture.some((category) => category.name.toLocaleLowerCase() === input.name.trim().toLocaleLowerCase())) {
    throw new ApiError(409, "Já existe uma categoria com esse nome");
  }
  const category: MovementCategory = { id: nextMovementCategoryId++, name: input.name.trim(), direction: input.direction };
  movementCategoriesFixture.push(category);
  return structuredClone(category);
}

export async function getCurrentUserRecord() {
  const user = findUser(currentUserFixture.id);
  const name = user.username.split(/[._-]/).map((part) => part ? `${part[0].toLocaleUpperCase()}${part.slice(1)}` : "").join(" ");
  return {
    id: user.id,
    name,
    role: user.accessLevel,
    email: user.email,
    lastLogin: user.lastLogin,
  };
}
