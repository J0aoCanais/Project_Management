import type { DocumentRecord } from "../../api/documentsApi";
import { formatFileSize, formatIsoDate } from "../../lib/format";
import Pill from "../ui/Pill";
import Table, { type TableColumn } from "../ui/Table";

interface Props {
  documents: DocumentRecord[];
}

const columns: TableColumn<DocumentRecord>[] = [
  { key: "name", header: "Documento", truncate: true, render: (document) => document.name },
  { key: "type", header: "Tipo", render: (document) => document.type },
  { key: "property", header: "Imóvel", render: (document) => document.propertyCode },
  { key: "entity", header: "Entidade associada", truncate: true, render: (document) => document.entity },
  { key: "size", header: "Tamanho", align: "right", render: (document) => formatFileSize(document.sizeBytes) },
  { key: "validity", header: "Validade", render: (document) => (document.validUntil ? formatIsoDate(document.validUntil) : "—") },
  { key: "status", header: "Estado", render: (document) => <Pill tone={document.status === "Válido" ? "green" : "amber"}>{document.status}</Pill> },
];

/** Lista de documentos, igual em oportunidades, investidores e (mais tarde) no menu Documentos. */
function DocumentsTable({ documents }: Props) {
  return <Table columns={columns} rows={documents} getRowKey={(document) => document.id} />;
}

export default DocumentsTable;
