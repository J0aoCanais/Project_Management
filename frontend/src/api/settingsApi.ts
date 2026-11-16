import * as store from "./fixtures/settingsStore";

export interface SettingsUser {
  id: number;
  username: string;
  email: string;
  accessLevel: string;
  lastLogin: string;
  active: boolean;
}

export interface Role {
  id: number;
  name: string;
}

export interface LeadSource {
  id: number;
  name: string;
  isActive: boolean;
}

export interface PhaseSetting {
  id: number;
  name: string;
  position: number;
  maxDaysStalled: number;
}

export interface MovementCategory {
  id: number;
  name: string;
  direction: "Entrada" | "Saída";
}

export interface NewUser {
  username: string;
  email: string;
  accessLevel: string;
  password: string;
}

export interface UserUpdate {
  accessLevel?: string;
  active?: boolean;
}

export interface LeadSourceInput {
  name?: string;
  isActive?: boolean;
}

export interface MovementCategoryInput {
  name: string;
  direction: MovementCategory["direction"];
}

export async function getUsers(): Promise<SettingsUser[]> {
  return store.listUsers();
}

export async function getRoles(): Promise<Role[]> {
  return store.listRoles();
}

export async function createUser(input: NewUser): Promise<SettingsUser> {
  return store.addUser(input);
}

export async function updateUser(id: number, input: UserUpdate): Promise<SettingsUser> {
  return store.editUser(id, input);
}

export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
  return store.updatePassword(input);
}

export async function getLeadSources(): Promise<LeadSource[]> {
  return store.listLeadSources();
}

export async function saveLeadSource(id: number | undefined, input: LeadSourceInput): Promise<LeadSource> {
  return store.saveLeadSource(id, input);
}

export async function getPhases(): Promise<PhaseSetting[]> {
  return store.listPhases();
}

export async function updatePhase(id: number, maxDaysStalled: number): Promise<PhaseSetting> {
  return store.editPhase(id, maxDaysStalled);
}

export async function getMovementCategories(): Promise<MovementCategory[]> {
  return store.listMovementCategories();
}

export async function saveMovementCategory(input: MovementCategoryInput): Promise<MovementCategory> {
  return store.addMovementCategory(input);
}
