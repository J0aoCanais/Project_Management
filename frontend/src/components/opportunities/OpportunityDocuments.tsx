import { useState } from "react";

import type { OpportunityDetail, OpportunityDocument } from "../../api/opportunitiesApi";
import { useUploadOpportunityDocuments } from "../../hooks/useOpportunities";
import { formatFileSize, formatIsoDate } from "../../lib/format";
import EmptyState from "../ui/EmptyState";
import FileUploadButton from "../ui/FileUploadButton";
import Notice from "../ui/Notice";
import Panel from "../ui/Panel";
import Pill from "../ui/Pill";
import Table, { type TableColumn } from "../ui/Table";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  detail: OpportunityDetail;
}

const DOCUMENT_TYPES = ["Caderneta predial", "Certidão permanente", "Orçamento de obra", "Planta", "Licença de utilização", "Certificado energético", "Outro"];

const columns: TableColumn<OpportunityDocument>[] = [
  { key: "name", header: "Documento", render: (document) => document.name },
  { key: "type", header: "Tipo", render: (document) => document.type },
  { key: "property", header: "Imóvel", render: (document) => document.propertyCode },
  { key: "entity", header: "Entidade associada", render: (document) => document.entity },
  { key: "size", header: "Tamanho", align: "right", render: (document) => formatFileSize(document.sizeBytes) },
  { key: "validity", header: "Validade", render: (document) => (document.validUntil ? formatIsoDate(document.validUntil) : "—") },
  { key: "status", header: "Estado", render: (document) => <Pill tone={document.status === "Válido" ? "green" : "amber"}>{document.status}</Pill> },
];

function OpportunityDocuments({ detail }: Props) {
  const upload = useUploadOpportunityDocuments();
  const [type, setType] = useState(DOCUMENT_TYPES[0]);

  return (
    <Panel className="overflow-hidden">
      <div className="p-2.5">
        <Notice>
          Pode carregar documentos em qualquer fase, incluindo o due diligence (certidões, cadernetas, orçamentos de obra…). Ficam associados ao imóvel{" "}
          {detail.property.code} e aparecem no menu Documentos.
        </Notice>
      </div>
      <div className="flex flex-col gap-2 border-b border-line px-3.5 pb-3 min-[721px]:flex-row min-[721px]:items-center">
        <strong className="text-xs min-[721px]:mr-auto">Documentos do imóvel</strong>
        <select aria-label="Tipo de documento" className={`${inputClasses} min-[721px]:w-auto`} value={type} onChange={(e) => setType(e.target.value)}>
          {DOCUMENT_TYPES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <FileUploadButton label="Carregar documentos" multiple onFiles={(files) => upload.mutate({ id: detail.id, files, type })} />
      </div>
      {upload.isError && (
        <div role="alert" className="p-2.5">
          <Notice tone="warning">Não foi possível carregar os documentos. Tente novamente.</Notice>
        </div>
      )}
      {detail.documents.length ? (
        <Table columns={columns} rows={detail.documents} getRowKey={(document) => document.id} />
      ) : (
        <EmptyState message="Ainda não há documentos." />
      )}
    </Panel>
  );
}

export default OpportunityDocuments;
