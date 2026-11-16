import { Link } from "react-router-dom";

import type { DocumentRecord } from "../../api/documentsApi";
import { OWNER_KIND_LABELS, expiryStatus } from "../../lib/documentRules";
import { formatFileSize, formatIsoDate, todayIso } from "../../lib/format";
import { entityPath } from "../../lib/links";
import Table, { type TableColumn } from "../ui/Table";

interface Props {
  documents: DocumentRecord[];
  /** Mostra a coluna "Associado a" (na biblioteca; no separador de um registo não é precisa). */
  showOwner?: boolean;
  onDelete: (document: DocumentRecord) => void;
}

const expiryClasses = { "Sem validade": "", Válido: "", "A expirar": "font-semibold text-warning", Expirado: "font-semibold text-danger" };

function Validity({ document }: { document: DocumentRecord }) {
  const status = expiryStatus(document.expiryDate, todayIso());
  if (!document.expiryDate) return <>—</>;
  return (
    <span className={expiryClasses[status]}>
      {formatIsoDate(document.expiryDate)}
      {(status === "A expirar" || status === "Expirado") && ` · ${status}`}
    </span>
  );
}

function DocumentsTable({ documents, showOwner = false, onDelete }: Props) {
  const columns: TableColumn<DocumentRecord>[] = [
    { key: "name", header: "Nome", render: (document) => <span className="block max-w-[280px] truncate" title={document.name}>{document.name}</span> },
    { key: "type", header: "Tipo", render: (document) => (document.photoStage ? `${document.type} (${document.photoStage})` : document.type) },
    ...(showOwner
      ? [
          {
            key: "owner",
            header: "Associado a",
            render: (document: DocumentRecord) => (
              <Link to={entityPath(document.owner)} className="text-brand hover:underline">
                <span className="text-muted">{OWNER_KIND_LABELS[document.owner.kind]} · </span>
                {document.owner.label}
              </Link>
            ),
          },
        ]
      : []),
    { key: "size", header: "Tamanho", align: "right", render: (document) => formatFileSize(document.sizeBytes) },
    { key: "uploaded", header: "Carregado em", render: (document) => formatIsoDate(document.uploadedAt) },
    { key: "validity", header: "Validade", render: (document) => <Validity document={document} /> },
    {
      key: "actions",
      header: "Ações",
      align: "right",
      render: (document) => (
        <button type="button" aria-label={`Eliminar ${document.name}`} onClick={() => onDelete(document)} className="text-xs font-semibold text-danger hover:underline">
          Eliminar
        </button>
      ),
    },
  ];
  return <Table columns={columns} rows={documents} getRowKey={(document) => document.id} />;
}

export default DocumentsTable;
