import { documentTypeOptions } from "../../temp";
import type { OpportunityDetail } from "../../api/opportunitiesApi";
import { useUploadOpportunityDocuments } from "../../hooks/useOpportunities";
import DocumentsPanel from "../documents/DocumentsPanel";
import Notice from "../ui/Notice";

interface Props {
  detail: OpportunityDetail;
}

function OpportunityDocuments({ detail }: Props) {
  const upload = useUploadOpportunityDocuments();

  return (
    <DocumentsPanel
      title="Documentos do imóvel"
      notice={
        <Notice>
          Pode carregar documentos em qualquer fase, incluindo o due diligence (certidões, cadernetas, orçamentos de obra…). Ficam associados ao imóvel{" "}
          {detail.property.code} e aparecem no menu Documentos.
        </Notice>
      }
      types={documentTypeOptions}
      documents={detail.documents}
      onUpload={(files, type) => upload.mutate({ id: detail.id, files, type })}
      isUploading={upload.isPending}
      uploadFailed={upload.isError}
      emptyMessage="Ainda não há documentos."
    />
  );
}

export default OpportunityDocuments;
