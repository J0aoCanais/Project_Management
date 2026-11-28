import type { BudgetItem } from "../api/worksApi";
import { isValidIsoDate } from "./format";
import {
  BUDGET_CATEGORIES,
  budgetItemErrors,
  formatBudgetImportRowErrors,
  parseExcelDecimal,
  type WorkPeriodBounds,
} from "./workRules";

export const BUDGET_EXCEL_COLUMNS = [
  "Categoria",
  "Empreiteiro",
  "Orçamentado",
  "Contratado",
  "Executado",
  "Faturado",
  "Pago",
  "Início previsto",
  "Fim previsto",
] as const;

export const MAX_EXCEL_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_EXCEL_ROWS = 500;

export interface ParsedBudgetRow {
  rowNumber: number;
  item: Omit<BudgetItem, "id">;
  errors: string[];
}

export interface BudgetExcelParseResult {
  rows: ParsedBudgetRow[];
  fileError?: string;
}

function normalizeHeader(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalCategory(raw: string): string {
  const trimmed = raw.trim();
  const match = BUDGET_CATEGORIES.find((cat) => cat.toLowerCase() === trimmed.toLowerCase());
  return match ?? trimmed;
}

function parseExcelDate(
  raw: unknown,
  parseDateCode: (serial: number) => { y: number; m: number; d: number } | null | undefined,
): string | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === "number") {
    const parsed = parseDateCode(raw);
    if (!parsed || !parsed.y || !parsed.m || !parsed.d) return "__INVALID__";
    return `${String(parsed.y).padStart(4, "0")}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
  }
  const text = String(raw).trim();
  if (!text) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return isValidIsoDate(text) ? text : "__INVALID__";
  }
  const ptMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(text);
  if (ptMatch) {
    const iso = `${ptMatch[3]}-${ptMatch[2].padStart(2, "0")}-${ptMatch[1].padStart(2, "0")}`;
    return isValidIsoDate(iso) ? iso : "__INVALID__";
  }
  return "__INVALID__";
}

/**
 * Gera e descarrega o template Excel (.xlsx) do orçamento de obra.
 * A biblioteca `xlsx` é carregada de forma preguiçosa via `import()`.
 */
export async function downloadBudgetTemplate(workPeriod?: WorkPeriodBounds, workId?: number): Promise<void> {
  const XLSX = await import("xlsx");

  const exampleStart = workPeriod?.plannedStartDate ?? "2026-08-01";
  const exampleEnd = workPeriod?.plannedEndDate ?? "2026-08-25";

  const budgetRows = [
    [...BUDGET_EXCEL_COLUMNS],
    [
      BUDGET_CATEGORIES[0],
      "Construções Silva & Filhos, Lda.",
      8000,
      8500,
      4000,
      3500,
      3500,
      exampleStart,
      exampleEnd,
    ],
  ];

  const budgetSheet = XLSX.utils.aoa_to_sheet(budgetRows);
  budgetSheet["!cols"] = [
    { wch: 28 },
    { wch: 32 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 15 },
    { wch: 15 },
  ];

  const categoriesRows = [["Categorias válidas"], ...BUDGET_CATEGORIES.map((category) => [category])];
  const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesRows);
  categoriesSheet["!cols"] = [{ wch: 32 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, budgetSheet, "Orçamento");
  XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Categorias");

  const fileName = workId ? `template-orcamento-obra-${workId}.xlsx` : "template-orcamento.xlsx";
  XLSX.writeFile(workbook, fileName);
}

/**
 * Lê e valida um ficheiro `.xlsx` de orçamento de obra.
 * A biblioteca `xlsx` é carregada de forma preguiçosa via `import()`.
 */
export async function parseBudgetExcel(
  file: File,
  workPeriod?: WorkPeriodBounds,
): Promise<BudgetExcelParseResult> {
  if (!/\.xlsx$/i.test(file.name)) {
    return { rows: [], fileError: "Apenas são aceites ficheiros Excel (.xlsx)." };
  }
  if (file.size > MAX_EXCEL_BYTES) {
    return { rows: [], fileError: "O ficheiro excede o limite máximo de 2 MB." };
  }

  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const sheetName =
    workbook.SheetNames.find((name) => normalizeHeader(name) === "orcamento") ??
    workbook.SheetNames[0];
  if (!sheetName) {
    return { rows: [], fileError: "O ficheiro não contém folhas de cálculo." };
  }

  const sheet = workbook.Sheets[sheetName];
  const rawGrid = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });

  const indexedNonEmpty = rawGrid
    .map((cells, idx) => ({ rowNumber: idx + 1, cells }))
    .filter(({ cells }) => cells.some((cell) => String(cell ?? "").trim() !== ""));

  if (!indexedNonEmpty.length) {
    return { rows: [], fileError: "Não foram encontradas linhas no ficheiro." };
  }

  const headerRow = indexedNonEmpty[0].cells.map((cell) => normalizeHeader(String(cell ?? "")));
  const findCol = (aliases: string[]): number =>
    headerRow.findIndex((header) => aliases.includes(header));

  const colIndex = {
    category: findCol(["categoria"]),
    contractor: findCol(["empreiteiro"]),
    budgeted: findCol(["orcamentado", "previsto", "valor previsto", "valor orcamentado"]),
    contracted: findCol(["contratado", "valor contratado"]),
    executed: findCol(["executado", "valor executado"]),
    invoiced: findCol(["faturado", "valor faturado"]),
    paid: findCol(["pago", "valor pago"]),
    plannedStart: findCol(["inicio previsto"]),
    plannedEnd: findCol(["fim previsto"]),
  };

  if (colIndex.category < 0 || colIndex.contractor < 0 || colIndex.budgeted < 0 || colIndex.contracted < 0) {
    return {
      rows: [],
      fileError:
        "Cabeçalhos inválidos. Descarregue o template e mantenha as colunas Categoria, Empreiteiro, Orçamentado, Contratado, Executado, Faturado, Pago, Início previsto e Fim previsto.",
    };
  }

  const dataRows = indexedNonEmpty.slice(1);
  if (!dataRows.length) {
    return { rows: [], fileError: "O ficheiro tem apenas o cabeçalho, sem linhas para importar." };
  }
  if (dataRows.length > MAX_EXCEL_ROWS) {
    return {
      rows: [],
      fileError: `O ficheiro tem ${dataRows.length} linhas preenchidas (máximo permitido: ${MAX_EXCEL_ROWS}).`,
    };
  }

  const getCell = (cells: unknown[], idx: number) => (idx >= 0 ? cells[idx] : undefined);

  const parsedRows: ParsedBudgetRow[] = dataRows.map(({ rowNumber, cells }) => {
    const categoryName = canonicalCategory(String(getCell(cells, colIndex.category) ?? ""));
    const contractorName = String(getCell(cells, colIndex.contractor) ?? "").trim();
    const budgetedValue = parseExcelDecimal(getCell(cells, colIndex.budgeted));
    const contractedValue = parseExcelDecimal(getCell(cells, colIndex.contracted));
    const executedValue = parseExcelDecimal(getCell(cells, colIndex.executed));
    const invoicedValue = parseExcelDecimal(getCell(cells, colIndex.invoiced));
    const paidValue = parseExcelDecimal(getCell(cells, colIndex.paid));
    const plannedStartDate = parseExcelDate(getCell(cells, colIndex.plannedStart), XLSX.SSF.parse_date_code);
    const plannedEndDate = parseExcelDate(getCell(cells, colIndex.plannedEnd), XLSX.SSF.parse_date_code);

    const item: Omit<BudgetItem, "id"> = {
      categoryName,
      contractorName,
      budgetedValue,
      contractedValue,
      executedValue,
      invoicedValue,
      paidValue,
      plannedStartDate: plannedStartDate === "__INVALID__" ? undefined : plannedStartDate,
      plannedEndDate: plannedEndDate === "__INVALID__" ? undefined : plannedEndDate,
    };

    const validationInput = {
      ...item,
      plannedStartDate,
      plannedEndDate,
    };

    const rawErrors = budgetItemErrors(validationInput, workPeriod, BUDGET_CATEGORIES);
    const errors = formatBudgetImportRowErrors(rowNumber, rawErrors);

    return { rowNumber, item, errors };
  });

  return { rows: parsedRows };
}
