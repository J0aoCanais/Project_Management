// Template e leitura de CSV para as importações (compatível com o Excel em pt-PT, que usa ";").

const BOM = "﻿";

/** Descarrega um CSV só com o cabeçalho. O BOM faz o Excel ler bem os acentos. */
export function downloadTemplate(columns: string[], fileName: string): void {
  const csv = `${BOM}${columns.join(";")}\r\n`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function splitLine(line: string, separator: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === separator && !quoted) {
      cells.push(current.trim());
      current = "";
    } else current += char;
  }
  cells.push(current.trim());
  return cells;
}

/** Devolve as linhas alinhadas com `columns`, sem cabeçalho. Células em falta ficam "—". */
export function parseCsv(text: string, columns: string[]): string[][] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const separator = lines[0].split(";").length >= lines[0].split(",").length ? ";" : ",";
  let rows = lines.map((line) => splitLine(line, separator));
  if (rows[0][0].toLowerCase() === columns[0].toLowerCase()) rows = rows.slice(1);
  return rows.filter((row) => row.some(Boolean)).map((row) => columns.map((_, index) => row[index] || "—"));
}
