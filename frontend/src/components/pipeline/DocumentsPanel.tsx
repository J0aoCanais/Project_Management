import { useState } from "react";

import type { OpportunityDocument } from "../../api/opportunitiesApi";
import { documentTypeOptions } from "../../temp";
import { formatFileSize, formatIsoDate } from "../../lib/format";
import EmptyState from "../ui/EmptyState";
import FileUploadButton from "../ui/FileUploadButton";
import Notice from "../ui/Notice";
import Panel from "../ui/Panel";
import Pill from "../ui/Pill";
import Select from "../ui/Select";
import Table, { type TableColumn } from "../ui/Table";

interface Props {
  documents: OpportunityDocument[];
  propertyCode: string;
  entityLabel: string;
  uploading: boolean;
  uploadFailed: boolean;
  onUpload: (files: File[], type: string) => void;
}

const columns: TableColumn<OpportunityDocument>[] = [
  { key: "name", header: "Documento", render: (document) => document.name },
  { key: "type", header: "Tipo", render: (document) => document.type },
  { key: "property", header: "Imóvel", render: (document) => document.propertyCode },
  { key: "entity", header: "Entidade associada", render: (document) => document.entity },
  { key: "size", header: "Tamanho", align: "right", render: (document) => formatFileSize(document.sizeBytes) },
  { key: "validity", header: "Validade", render: (document) => (document.validUntil ? formatIsoDate(document.validUntil) : "—") },
  { key: "status", header: "Estado", render: (document) => <Pill tone={document.status === "Válido" ? "green" : "amber"}>{document.status}</Pill> },
];

function DocumentsPanel({ documents, propertyCode, entityLabel, uploading, uploadFailed, onUpload }: Props) {
  const [type, setType] = useState(documentTypeOptions[0]);

  return (
    <Panel className="overflow-hidden">
      <div className="p-2.5">
        <Notice>
          Pode carregar documentos em qualquer fase. Ficam associados ao imóvel {propertyCode} e à entidade {entityLabel}.
        </Notice>
      </div>
      <div className="flex flex-col gap-2 border-b border-line px-3.5 pb-3 min-[721px]:flex-row min-[721px]:items-center">
        <strong className="text-xs min-[721px]:mr-auto">Documentos</strong>
        <Select label="Tipo de documento" className="min-[721px]:w-auto" value={type} onChange={setType} options={documentTypeOptions} />
        <FileUploadButton
          label={uploading ? "A carregar…" : "Carregar documentos"}
          multiple
          onFiles={(files) => onUpload(files, type)}
        />
      </div>
      {uploadFailed && (
        <div role="alert" className="p-2.5">
          <Notice tone="warning">Não foi possível carregar os documentos. Tente novamente.</Notice>
        </div>
      )}
      {documents.length ? <Table columns={columns} rows={documents} getRowKey={(document) => document.id} /> : <EmptyState message="Ainda não há documentos." />}
    </Panel>
  );
}

export default DocumentsPanel;
