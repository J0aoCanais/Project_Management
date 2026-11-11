import { useState, type ReactNode } from "react";

import { formatFileSize, formatIsoDate } from "../../lib/format";
import EmptyState from "../ui/EmptyState";
import FileUploadButton from "../ui/FileUploadButton";
import Notice from "../ui/Notice";
import Panel from "../ui/Panel";
import Pill from "../ui/Pill";
import Select from "../ui/Select";
import Table, { type TableColumn } from "../ui/Table";

export interface DocumentRow {
  id: string;
  name: string;
  type: string;
  entity?: string;
  propertyCode?: string;
  sizeBytes: number;
  validUntil?: string;
  status: string;
  photoStage?: string;
}

interface Props {
  title?: string;
  notice?: ReactNode;
  types: string[];
  photoStages?: string[];
  documents: DocumentRow[];
  onUpload: (files: File[], type: string, photoStage?: string) => void;
  isUploading?: boolean;
  uploadFailed?: boolean;
  emptyMessage?: string;
}

const columns: TableColumn<DocumentRow>[] = [
  { key: "name", header: "Documento", render: (doc) => doc.name },
  {
    key: "type",
    header: "Tipo",
    render: (doc) => (doc.photoStage ? `${doc.type} (${doc.photoStage})` : doc.type),
  },
  { key: "property", header: "Imóvel / Código", render: (doc) => doc.propertyCode ?? "—" },
  { key: "entity", header: "Entidade associada", render: (doc) => doc.entity ?? "—" },
  { key: "size", header: "Tamanho", align: "right", render: (doc) => formatFileSize(doc.sizeBytes) },
  { key: "validity", header: "Validade", render: (doc) => (doc.validUntil ? formatIsoDate(doc.validUntil) : "—") },
  {
    key: "status",
    header: "Estado",
    render: (doc) => <Pill tone={doc.status === "Válido" ? "green" : "amber"}>{doc.status}</Pill>,
  },
];

function DocumentsPanel({
  title = "Documentos",
  notice,
  types,
  photoStages,
  documents,
  onUpload,
  uploadFailed,
  emptyMessage = "Ainda não há documentos.",
}: Props) {
  const [type, setType] = useState(types[0] ?? "");
  const [photoStage, setPhotoStage] = useState(photoStages?.[0] ?? "Antes");

  const isPhoto = type === "Fotografia de obra" && photoStages && photoStages.length > 0;

  const handleFiles = (files: File[]) => {
    onUpload(files, type, isPhoto ? photoStage : undefined);
  };

  return (
    <Panel className="overflow-hidden">
      {notice && <div className="p-2.5">{notice}</div>}
      <div className="flex flex-col gap-2 border-b border-line px-3.5 pb-3 min-[721px]:flex-row min-[721px]:items-center">
        <strong className="text-xs min-[721px]:mr-auto">{title}</strong>
        <div className="flex flex-wrap items-center gap-2">
          <Select label="Tipo de documento" className="min-[721px]:w-auto" value={type} onChange={setType} options={types} />
          {isPhoto && (
            <Select
              label="Fase da fotografia"
              className="min-[721px]:w-auto"
              value={photoStage}
              onChange={setPhotoStage}
              options={photoStages}
            />
          )}
          <FileUploadButton label="Carregar documentos" multiple onFiles={handleFiles} />
        </div>
      </div>
      {uploadFailed && (
        <div role="alert" className="p-2.5">
          <Notice tone="warning">Não foi possível carregar os documentos. Tente novamente.</Notice>
        </div>
      )}
      {documents.length ? (
        <Table columns={columns} rows={documents} getRowKey={(document) => document.id} />
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </Panel>
  );
}

export default DocumentsPanel;
