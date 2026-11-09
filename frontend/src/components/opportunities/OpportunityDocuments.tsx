import { documentTypeOptions } from "../../temp";
import { useState } from "react";

import type { OpportunityDetail } from "../../api/opportunitiesApi";
import { useUploadOpportunityDocuments } from "../../hooks/useOpportunities";
import DocumentsTable from "../documents/DocumentsTable";
import EmptyState from "../ui/EmptyState";
import FileUploadButton from "../ui/FileUploadButton";
import Notice from "../ui/Notice";
import Panel from "../ui/Panel";
import Select from "../ui/Select";

interface Props {
  detail: OpportunityDetail;
}


function OpportunityDocuments({ detail }: Props) {
  const upload = useUploadOpportunityDocuments();
  const [type, setType] = useState(documentTypeOptions[0]);

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
        <Select label="Tipo de documento" className="min-[721px]:w-auto" value={type} onChange={setType} options={documentTypeOptions} />
        <FileUploadButton label="Carregar documentos" multiple onFiles={(files) => upload.mutate({ id: detail.id, files, type })} />
      </div>
      {upload.isError && (
        <div role="alert" className="p-2.5">
          <Notice tone="warning">Não foi possível carregar os documentos. Tente novamente.</Notice>
        </div>
      )}
      {detail.documents.length ? (
        <DocumentsTable documents={detail.documents} />
      ) : (
        <EmptyState message="Ainda não há documentos." />
      )}
    </Panel>
  );
}

export default OpportunityDocuments;
