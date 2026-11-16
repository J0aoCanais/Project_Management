import { NO_OPERATION, effectiveDateError, financingErrors, movementErrors, movementStatus } from "../../lib/financeRules";
import { todayIso } from "../../lib/format";
import { ApiError } from "../client";
import type { Financing, FinancingInput, Movement, MovementFilters, MovementInput, MovementLink, MovementOptions } from "../financeApi";
import { financingsFixture, worksFixture, investorsFixture, movementCategoriesFixture, movementsFixture, operationsFixture } from "../../temp";
import { respond } from "./respond";

// TODO: trocar pelo endpoint quando existir. Simula o servidor: as alterações ficam em memória até recarregar a página.

type MovementRecord = (typeof movementsFixture)[number];

const category = (id: number) => movementCategoriesFixture.find((item) => item.id === id);

/** Soma das saídas associadas a um item de orçamento. */
function budgetUsed(itemId: number): number {
  return movementsFixture
    .filter((item) => item.link?.kind === "budgetItem" && item.link.id === itemId && category(item.categoryId)?.direction === "Saída")
    .reduce((sum, item) => sum + item.amount, 0);
}

function options(): MovementOptions {
  return {
    categories: movementCategoriesFixture,
    operations: operationsFixture.map((item) => ({ id: item.id, label: `${item.code} · ${item.zone}` })),
    investments: investorsFixture.flatMap((investor) => investor.investments.map((item) => ({ id: item.id, label: `${investor.name} · ${item.operationCode}`, investorId: investor.id }))),
    // Os itens de orçamento são os das obras (tarefa 06).
    budgetItems: worksFixture.flatMap((work) =>
      work.budgetItems.map((item) => ({ id: item.id, label: `${item.categoryName} · ${work.name}`, workId: work.id, contracted: item.contractedValue, used: budgetUsed(item.id) })),
    ),
    financings: financingsFixture.map((item) => ({ id: item.id, label: item.name })),
  };
}

function linkOf(record: MovementRecord, available: MovementOptions): MovementLink | undefined {
  if (!record.link) return undefined;
  const { kind, id } = record.link;
  switch (kind) {
    case "operation": {
      const ref = available.operations.find((item) => item.id === id);
      return ref && { kind, id, label: ref.label };
    }
    case "investment": {
      const ref = available.investments.find((item) => item.id === id);
      return ref && { kind, id, label: ref.label, parentId: ref.investorId };
    }
    case "budgetItem": {
      const ref = available.budgetItems.find((item) => item.id === id);
      return ref && { kind, id, label: ref.label, parentId: ref.workId };
    }
    case "financing": {
      const ref = available.financings.find((item) => item.id === id);
      return ref && { kind, id, label: ref.label };
    }
  }
}

function toMovement(record: MovementRecord, available = options()): Movement {
  const { name, direction } = category(record.categoryId) ?? { name: "Sem categoria", direction: "Saída" as const };
  return {
    id: record.id,
    categoryId: record.categoryId,
    category: name,
    direction,
    amount: record.amount,
    expectedDate: record.expectedDate,
    effectiveDate: record.effectiveDate,
    notes: record.notes,
    status: movementStatus(record.expectedDate, record.effectiveDate, todayIso()),
    link: linkOf(record, available),
  };
}

function find(id: number): MovementRecord {
  const record = movementsFixture.find((item) => item.id === id);
  if (!record) throw new ApiError(404, "Movimento não encontrado");
  return record;
}

const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Operação a que o movimento está associado diretamente. */
function operationLabel(movement: Movement): string | undefined {
  return movement.link?.kind === "operation" ? movement.link.label : undefined;
}

export function listMovements(filters: MovementFilters) {
  const available = options();
  const term = normalize(filters.q?.trim() ?? "");
  const rows = movementsFixture
    .map((record) => toMovement(record, available))
    .filter((movement) => {
      const operation = operationLabel(movement);
      return (
        (!term || normalize(`${movement.notes ?? ""} ${movement.category}`).includes(term)) &&
        (!filters.category || movement.category === filters.category) &&
        (!filters.direction || movement.direction === filters.direction) &&
        (!filters.status || movement.status === filters.status) &&
        (!filters.operation || (filters.operation === NO_OPERATION ? !operation : operation === filters.operation)) &&
        (!filters.link || (movement.link?.kind === filters.link.kind && movement.link.id === filters.link.id))
      );
    })
    // Mais recentes primeiro, pela data efetiva ou prevista.
    .sort((a, b) => (b.effectiveDate ?? b.expectedDate ?? "").localeCompare(a.effectiveDate ?? a.expectedDate ?? ""));
  return respond(rows);
}

export async function findMovement(id: number) {
  await respond(null);
  return structuredClone(toMovement(find(id)));
}

export function listOptions() {
  return respond(options());
}

function validate(input: MovementInput, original?: Movement) {
  const invalid = Object.values(movementErrors(input, { today: todayIso(), options: options(), original }))[0];
  if (invalid) throw new ApiError(422, invalid);
}

function clean(input: MovementInput): Omit<MovementRecord, "id"> {
  return {
    categoryId: input.categoryId,
    amount: input.amount,
    expectedDate: input.expectedDate || undefined,
    effectiveDate: input.effectiveDate || undefined,
    link: input.link && { kind: input.link.kind, id: input.link.id },
    notes: input.notes?.trim() || undefined,
  };
}

export async function addMovement(input: MovementInput) {
  await respond(null);
  // O servidor valida sempre, mesmo que o formulário já o tenha feito.
  validate(input);
  const record: MovementRecord = { id: Math.max(0, ...movementsFixture.map((item) => item.id)) + 1, ...clean(input) };
  movementsFixture.push(record);
  return structuredClone(toMovement(record));
}

export async function editMovement(id: number, input: MovementInput) {
  await respond(null);
  const record = find(id);
  validate(input, toMovement(record));
  Object.assign(record, clean(input));
  return structuredClone(toMovement(record));
}

export async function markDone(id: number, effectiveDate: string) {
  await respond(null);
  const record = find(id);
  const invalid = effectiveDateError(effectiveDate, todayIso(), true);
  if (invalid) throw new ApiError(422, invalid);
  record.effectiveDate = effectiveDate;
  return structuredClone(toMovement(record));
}

function toFinancing(item: (typeof financingsFixture)[number]): Financing {
  const used = movementsFixture
    .filter((movement) => movement.link?.kind === "financing" && movement.link.id === item.id && category(movement.categoryId)?.direction === "Entrada")
    .reduce((sum, movement) => sum + movement.amount, 0);
  return { ...item, used, available: item.amount - used };
}

export function listFinancings() {
  return respond(financingsFixture.map(toFinancing));
}

export async function addFinancing(input: FinancingInput) {
  await respond(null);
  const invalid = Object.values(financingErrors(input))[0];
  if (invalid) throw new ApiError(422, invalid);
  const item = { id: Math.max(0, ...financingsFixture.map((entry) => entry.id)) + 1, name: input.name.trim(), amount: input.amount };
  financingsFixture.push(item);
  return structuredClone(toFinancing(item));
}
