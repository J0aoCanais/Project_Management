import assert from "node:assert/strict";
import test from "node:test";

import {
  BUDGET_CATEGORIES,
  budgetItemErrors,
  formatBudgetImportRowErrors,
  parseExcelDecimal,
  planningProgress,
} from "../src/lib/workRules.ts";

test("planningProgress sem datas planeadas devolve 'Sem planeamento definido'", () => {
  const result = planningProgress({ executedPercent: 40 }, "2026-11-28");
  assert.equal(result.hasPlan, false);
  assert.equal(result.summary, "Sem planeamento definido");
});

test("planningProgress calcula dias decorridos, % do prazo e % executado", () => {
  const result = planningProgress(
    {
      plannedStartDate: "2026-08-01",
      plannedEndDate: "2026-11-29",
      executedPercent: 30,
      state: "Em curso",
    },
    "2026-09-15",
  );
  assert.equal(result.hasPlan, true);
  assert.equal(result.elapsedDays, 45);
  assert.equal(result.totalDays, 120);
  assert.equal(result.timePercent, 38);
  assert.equal(result.executedPercent, 30);
  assert.equal(result.isOverdue, false);
  assert.equal(result.behindSchedule, true);
  assert.equal(result.summary, "Dia 45 de 120 · 38 % do prazo · 30 % executado");
});

test("planningProgress assinala obra atrasada quando prazo já passou e não está concluída", () => {
  const result = planningProgress(
    {
      plannedStartDate: "2026-08-01",
      plannedEndDate: "2026-11-01",
      executedPercent: 57,
      state: "Atrasada",
    },
    "2026-11-11",
  );
  assert.equal(result.isOverdue, true);
  assert.equal(result.overdueDays, 10);
  assert.equal(result.summary, "Atrasada 10 dias · 57 % executado");
});

test("planningProgress não marca atrasada quando a obra está concluída", () => {
  const result = planningProgress(
    {
      plannedStartDate: "2026-03-01",
      plannedEndDate: "2026-06-30",
      executedPercent: 100,
      state: "Concluída",
    },
    "2026-11-11",
  );
  assert.equal(result.isOverdue, false);
  assert.equal(result.overdueDays, 0);
  assert.equal(result.timePercent, 100);
});

test("budgetItemErrors valida ordem de datas e limites da obra em pt-PT", () => {
  const baseItem = {
    categoryName: BUDGET_CATEGORIES[0],
    contractorName: "Construções Silva",
    budgetedValue: 5000,
    contractedValue: 5000,
    executedValue: 2000,
    invoicedValue: 1000,
    paidValue: 1000,
  };
  const workPeriod = {
    plannedStartDate: "2026-08-01",
    plannedEndDate: "2026-11-01",
    realStartDate: "2026-08-10",
  };

  const endBeforeStart = budgetItemErrors(
    { ...baseItem, plannedStartDate: "2026-09-10", plannedEndDate: "2026-09-01" },
    workPeriod,
  );
  assert.match(endBeforeStart.plannedEndDate ?? "", /posterior ou igual/);

  const outsideWorkPeriod = budgetItemErrors(
    { ...baseItem, plannedStartDate: "2026-07-15", plannedEndDate: "2026-11-15" },
    workPeriod,
  );
  assert.match(outsideWorkPeriod.plannedStartDate ?? "", /início previsto da obra/);
  assert.match(outsideWorkPeriod.plannedEndDate ?? "", /fim previsto da obra/);

  const valid = budgetItemErrors(
    { ...baseItem, plannedStartDate: "2026-08-15", plannedEndDate: "2026-09-30" },
    workPeriod,
    BUDGET_CATEGORIES,
  );
  assert.deepEqual(valid, {});
});

test("parseExcelDecimal e formatBudgetImportRowErrors suportam vírgula/ponto e formatam linhas", () => {
  assert.equal(parseExcelDecimal("1250,50"), 1250.5);
  assert.equal(parseExcelDecimal("1250.50"), 1250.5);
  assert.equal(parseExcelDecimal("1.250,50 €"), 1250.5);
  assert.equal(parseExcelDecimal(""), 0);
  assert.ok(Number.isNaN(parseExcelDecimal("abc")));

  const formatted = formatBudgetImportRowErrors(7, {
    contractedValue: "Valor contratado inválido.",
  });
  assert.deepEqual(formatted, ["Linha 7: valor contratado inválido"]);
});
