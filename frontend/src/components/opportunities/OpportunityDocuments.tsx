import type { OpportunityDetail } from "../../api/opportunitiesApi";
import { useUploadOpportunityDocuments } from "../../hooks/useOpportunities";
import DocumentsPanel from "../pipeline/DocumentsPanel";

interface Props {
  detail: OpportunityDetail;
}

function OpportunityDocuments({ detail }: Props) {
  const upload = useUploadOpportunityDocuments();
  return (
    <DocumentsPanel
      documents={detail.documents}
      propertyCode={detail.property.code}
      entityLabel={`oportunidade ${detail.title}`}
      uploading={upload.isPending}
      uploadFailed={upload.isError}
      onUpload={(files, type) => upload.mutate({ id: detail.id, files, type })}
    />
  );
}

export default OpportunityDocuments;
