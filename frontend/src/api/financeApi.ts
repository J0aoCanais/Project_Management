import * as store from "./fixtures/financeStore";

// Alinhado com `FinancialMovement`, `MovementCategory` e `Financing` em app/models.py.

export type MovementDirection = "Entrada" | "Saída";
export type MovementStatus = "Previsto" | "Realizado" | "Atrasado";
/** A que um movimento pode estar associado. */
export type MovementLinkKind = "operation" | "investment" | "budgetItem" | "financing";

export interface MovementCategory {
  id: number;
  name: string;
  direction: MovementDirection;
}

export interface MovementLink {
  kind: MovementLinkKind;
  id: number;
  label: string;
  /** Obra do item de orçamento ou investidor do investimento (para o link). */
  parentId?: number;
}

export interface Movement {
  id: number;
  categoryId: number;
  category: string;
  direction: MovementDirection;
  /** Sempre positivo; o sinal vem da direção. */
  amount: number;
  /** "aaaa-mm-dd" */
  expectedDate?: string;
  effectiveDate?: string;
  notes?: string;
  /** Calculado pelo servidor a partir das datas (`movementStatus`). */
  status: MovementStatus;
  link?: MovementLink;
}

export interface MovementInput {
  categoryId: number;
  amount: number;
  expectedDate?: string;
  effectiveDate?: string;
  link?: { kind: MovementLinkKind; id: number };
  notes?: string;
}

export interface MovementFilters {
  q?: string;
  category?: string;
  direction?: MovementDirection;
  status?: MovementStatus;
  /** Nome da operação ou "Sem operação". */
  operation?: string;
  /** Movimentos de uma entidade, para os detalhes de operação, investimento e obra. */
  link?: { kind: MovementLinkKind; id: number };
}

/** Item de orçamento de obra que se pode associar a uma saída. */
export interface BudgetItemRef {
  id: number;
  label: string;
  workId: number;
  /** Valor contratado com o fornecedor. */
  contracted: number;
  /** Soma das saídas já associadas a este item. */
  used: number;
}

export interface MovementOptions {
  categories: MovementCategory[];
  operations: { id: number; label: string }[];
  investments: { id: number; label: string; investorId: number }[];
  budgetItems: BudgetItemRef[];
  financings: { id: number; label: string }[];
}

export interface Financing {
  id: number;
  name: string;
  amount: number;
  /** Soma dos movimentos associados. */
  used: number;
  available: number;
}

export interface FinancingInput {
  name: string;
  amount: number;
}

// TODO: trocar pelo endpoint quando existir. Cada função indica o pedido previsto.

export async function getMovements(filters: MovementFilters = {}): Promise<Movement[]> {
  // apiFetch<Movement[]>(`/v1/financial-movements?${params}`)
  return store.listMovements(filters);
}

export async function getMovement(id: number): Promise<Movement> {
  // apiFetch<Movement>(`/v1/financial-movements/${id}`)
  return store.findMovement(id);
}

export async function getMovementOptions(): Promise<MovementOptions> {
  // GET /v1/movement-categories, /v1/operations, /v1/investments, /v1/construction-budget-items, /v1/financings
  return store.listOptions();
}

export async function createMovement(input: MovementInput): Promise<Movement> {
  // POST /v1/financial-movements
  return store.addMovement(input);
}

export async function updateMovement(id: number, input: MovementInput): Promise<Movement> {
  // PATCH /v1/financial-movements/${id}
  return store.editMovement(id, input);
}

export async function markMovementDone(id: number, effectiveDate: string): Promise<Movement> {
  // PATCH /v1/financial-movements/${id} { effective_date }
  return store.markDone(id, effectiveDate);
}

export async function getFinancings(): Promise<Financing[]> {
  // apiFetch<Financing[]>("/v1/financings")
  return store.listFinancings();
}

export async function createFinancing(input: FinancingInput): Promise<Financing> {
  // POST /v1/financings
  return store.addFinancing(input);
}
