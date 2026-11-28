import { useMemo, useState } from "react";

import type { BudgetImportMode, WorkDetail } from "../../api/worksApi";
import { useImportBudgetItems } from "../../hooks/useWorks";
import {
  downloadBudgetTemplate,
  parseBudgetExcel,
  type ParsedBudgetRow,
} from "../../lib/budgetExcel";
import { formatIsoDate, formatMoney } from "../../lib/format";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import Drawer from "../ui/Drawer";
import FileUploadButton from "../ui/FileUploadButton";
import ImportStep from "../ui/ImportStep";
import Notice from "../ui/Notice";
import Panel from "../ui/Panel";
import SegmentedChoice from "../ui/SegmentedChoice";

interface Props {
  work: WorkDetail;
  onClose: () => void;
}

const formatCellMoney = (value: number) =>
  Number.isFinite(value) ? formatMoney(value) : "Inválido";

function ImportBudgetDrawer({ work, onClose }: Props) {
  const importMutation = useImportBudgetItems(work.id);

  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedBudgetRow[]>([]);
  const [mode, setMode] = useState<BudgetImportMode>("append");
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [parsing, setParsing] = useState(false);

  const errorCount = useMemo(
    () => rows.filter((row) => row.errors.length > 0).length,
    [rows],
  );
  const hasErrors = errorCount > 0;
  const canImport = rows.length > 0 && !hasErrors && !fileError && !parsing && !importMutation.isPending;

  const handleFiles = async ([file]: File[]) => {
    setFileName(file.name);
    setFileError(null);
    setServerError(null);
    setParsing(true);
    try {
      const result = await parseBudgetExcel(file, work);
      setRows(result.rows);
      if (result.fileError) setFileError(result.fileError);
    } catch {
      setRows([]);
      setFileError("Não foi possível ler o ficheiro Excel. Confirme que é um .xlsx válido.");
    } finally {
      setParsing(false);
    }
  };

  const executeImport = () => {
    setServerError(null);
    importMutation.mutate(
      {
        items: rows.map((row) => row.item),
        mode,
      },
      {
        onSuccess: () => {
          setConfirmReplace(false);
          onClose();
        },
        onError: (err) => {
          setConfirmReplace(false);
          setServerError(err instanceof Error ? err.message : "Não foi possível importar o orçamento.");
        },
      },
    );
  };

  const handleImportClick = () => {
    if (!canImport) return;
    if (mode === "replace") {
      setConfirmReplace(true);
    } else {
      executeImport();
    }
  };

  return (
    <>
      <Drawer
        wide
        title="Importar orçamento"
        subtitle={`Carregar rubricas a partir de Excel (.xlsx) para ${work.name}`}
        onClose={onClose}
        footer={
          <>
            <Button onClick={onClose}>Cancelar</Button>
            <Button
              variant="primary"
              disabled={!canImport}
              onClick={handleImportClick}
            >
              {importMutation.isPending
                ? "A importar…"
                : rows.length
                  ? `Importar ${rows.length} ${rows.length === 1 ? "linha" : "linhas"}`
                  : "Importar"}
            </Button>
          </>
        }
      >
        <ol className="m-0 grid list-none gap-2 p-0">
          <ImportStep
            number={1}
            title="Descarregar o template Excel"
            description="Inclui cabeçalhos obrigatórios, linha de exemplo e folha 'Categorias' com os valores válidos."
            action={
              <Button icon="download" onClick={() => void downloadBudgetTemplate(work, work.id)}>
                Descarregar template
              </Button>
            }
          />
          <ImportStep
            number={2}
            title="Carregar ficheiro preenchido"
            description={fileName ?? "Apenas .xlsx · máximo 2 MB e 500 linhas"}
            action={
              <FileUploadButton
                label={fileName ? "Escolher outro" : "Escolher ficheiro"}
                accept=".xlsx"
                onFiles={(files) => void handleFiles(files)}
              />
            }
          />
        </ol>

        <Panel className="flex flex-wrap items-center justify-between gap-2 p-3">
          <div>
            <strong className="block text-xs text-ink">Modo de importação</strong>
            <span className="text-[11px] text-muted">
              Escolha se pretende acrescentar às rubricas atuais ou substituir todo o orçamento.
            </span>
          </div>
          <SegmentedChoice
            label="Modo de importação"
            value={mode}
            onChange={setMode}
            options={[
              { value: "append", label: "Acrescentar" },
              { value: "replace", label: "Substituir" },
            ]}
          />
        </Panel>

        {serverError && <Notice tone="warning">{serverError}</Notice>}
        {fileError && <Notice tone="warning">{fileError}</Notice>}

        {hasErrors && (
          <Notice tone="warning">
            Foram encontrados erros em {errorCount} {errorCount === 1 ? "linha" : "linhas"}. Corrija o ficheiro Excel e volte a carregar para poder importar.
          </Notice>
        )}

        {rows.length > 0 && (
          <Panel className="min-w-0 overflow-hidden">
            <div className="border-b border-line px-3 py-2 text-xs font-bold text-ink">
              Pré-visualização ({rows.length} {rows.length === 1 ? "linha" : "linhas"})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse whitespace-nowrap text-xs">
                <thead>
                  <tr className="border-b border-line bg-surface text-[11px] font-semibold text-muted uppercase">
                    <th className="px-2.5 py-2 text-left">Linha</th>
                    <th className="px-2.5 py-2 text-left">Categoria</th>
                    <th className="px-2.5 py-2 text-left">Empreiteiro</th>
                    <th className="px-2.5 py-2 text-right">Orçamentado</th>
                    <th className="px-2.5 py-2 text-right">Contratado</th>
                    <th className="px-2.5 py-2 text-right">Executado</th>
                    <th className="px-2.5 py-2 text-right">Faturado</th>
                    <th className="px-2.5 py-2 text-right">Pago</th>
                    <th className="px-2.5 py-2 text-left">Datas previstas</th>
                    <th className="px-2.5 py-2 text-left">Validação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((row) => {
                    const invalid = row.errors.length > 0;
                    const dateLabel =
                      row.item.plannedStartDate || row.item.plannedEndDate
                        ? `${row.item.plannedStartDate ? formatIsoDate(row.item.plannedStartDate) : "—"} → ${row.item.plannedEndDate ? formatIsoDate(row.item.plannedEndDate) : "—"}`
                        : "—";
                    return (
                      <tr
                        key={row.rowNumber}
                        className={invalid ? "bg-danger-soft text-danger" : "bg-white text-ink"}
                      >
                        <td className="px-2.5 py-2 font-semibold tabular-nums">{row.rowNumber}</td>
                        <td className="px-2.5 py-2 font-semibold">{row.item.categoryName || "—"}</td>
                        <td className="px-2.5 py-2">{row.item.contractorName || "—"}</td>
                        <td className="px-2.5 py-2 text-right tabular-nums">{formatCellMoney(row.item.budgetedValue)}</td>
                        <td className="px-2.5 py-2 text-right tabular-nums">{formatCellMoney(row.item.contractedValue)}</td>
                        <td className="px-2.5 py-2 text-right tabular-nums">{formatCellMoney(row.item.executedValue)}</td>
                        <td className="px-2.5 py-2 text-right tabular-nums">{formatCellMoney(row.item.invoicedValue)}</td>
                        <td className="px-2.5 py-2 text-right tabular-nums">{formatCellMoney(row.item.paidValue)}</td>
                        <td className="px-2.5 py-2 text-[11px]">{dateLabel}</td>
                        <td className="px-2.5 py-2 text-[11px] whitespace-normal min-w-[220px]">
                          {invalid ? (
                            <span className="font-semibold text-danger">{row.errors.join(" · ")}</span>
                          ) : (
                            <span className="font-semibold text-success">Válida</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </Drawer>

      {confirmReplace && (
        <Dialog
          title="Substituir orçamento existente?"
          description={`Esta ação vai apagar as ${work.budgetItems.length} ${work.budgetItems.length === 1 ? "linha existente" : "linhas existentes"} e substituí-las pelas ${rows.length} ${rows.length === 1 ? "linha importada" : "linhas importadas"}.`}
          onClose={() => setConfirmReplace(false)}
          footer={
            <>
              <Button onClick={() => setConfirmReplace(false)}>Cancelar</Button>
              <Button variant="danger" disabled={importMutation.isPending} onClick={executeImport}>
                {importMutation.isPending ? "A substituir…" : "Confirmar substituição"}
              </Button>
            </>
          }
        />
      )}
    </>
  );
}

export default ImportBudgetDrawer;
