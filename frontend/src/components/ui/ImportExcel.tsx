import { useMemo, useState } from "react";

import { downloadTemplate, parseCsv } from "../../lib/csv";
import Button from "./Button";
import Dialog from "./Dialog";
import FileUploadButton from "./FileUploadButton";
import ImportStep from "./ImportStep";
import Notice from "./Notice";
import Panel from "./Panel";
import Table, { type TableColumn } from "./Table";

export interface ImportConfig {
  title: string;
  templateName: string;
  columns: string[];
  /** Linhas de exemplo mostradas para .xlsx, que ainda não é lido a sério. */
  sample: string[][];
}

interface Props {
  config: ImportConfig;
  /** Nomes (primeira coluna) que já existem; estas linhas são ignoradas. */
  existingNames: string[];
  onClose: () => void;
  onImport: (rows: string[][]) => void;
}

/** Importação genérica: descarregar template, carregar ficheiro, rever e importar. */
function ImportExcel({ config, existingNames, onClose, onImport }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<string[][]>([]);

  const fresh = useMemo(() => {
    const known = new Set(existingNames.map((name) => name.toLowerCase()));
    return rows.filter((row) => !known.has(row[0].toLowerCase()));
  }, [rows, existingNames]);
  const duplicates = rows.length - fresh.length;

  const columns: TableColumn<string[]>[] = config.columns.map((header, index) => ({
    key: header,
    header,
    render: (row) => row[index],
  }));

  const handleFile = async ([file]: File[]) => {
    setFileName(file.name);
    setRows(/\.(csv|txt)$/i.test(file.name) ? parseCsv(await file.text(), config.columns) : config.sample);
  };

  const footer = (
    <>
      <Button onClick={onClose}>Cancelar</Button>
      <Button
        variant="primary"
        disabled={!fresh.length}
        onClick={() => {
          onImport(fresh);
          onClose();
        }}
      >
        {fresh.length ? `Importar ${fresh.length} ${fresh.length === 1 ? "linha" : "linhas"}` : "Importar"}
      </Button>
    </>
  );

  return (
    <Dialog
      wide
      title={config.title}
      description="Preencha o template no Excel e carregue o ficheiro."
      onClose={onClose}
      footer={footer}
    >
      <ol className="m-0 grid list-none gap-1.5 p-0">
        <ImportStep
          number={1}
          title="Descarregar o template"
          description={`Colunas: ${config.columns.join(" · ")}`}
          action={
            <Button icon="download" onClick={() => downloadTemplate(config.columns, config.templateName)}>
              Descarregar template
            </Button>
          }
        />
        <ImportStep
          number={2}
          title="Carregar o ficheiro preenchido"
          description={fileName ?? "Excel (.xlsx) ou CSV"}
          action={
            <FileUploadButton label={fileName ? "Escolher outro" : "Escolher ficheiro"} accept=".csv,.txt,.xlsx,.xls" onFiles={handleFile} />
          }
        />
      </ol>
      {fileName && !rows.length && <Notice tone="warning">Não foram encontradas linhas no ficheiro. Confirme que usou o template.</Notice>}
      {duplicates > 0 && (
        <Notice tone="warning">
          {duplicates === 1 ? "1 linha já existe na plataforma e não será importada." : `${duplicates} linhas já existem na plataforma e não serão importadas.`}
        </Notice>
      )}
      {rows.length > 0 && (
        <Panel>
          <Table columns={columns} rows={rows} getRowKey={(_, index) => index} />
        </Panel>
      )}
    </Dialog>
  );
}

export default ImportExcel;
