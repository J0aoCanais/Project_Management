import { useState, type ReactNode } from "react";

import { ApiError } from "../../api/client";
import type { DocumentOwner, DocumentRecord } from "../../api/documentsApi";
import { useDocuments, useUploadDocuments } from "../../hooks/useDocuments";
import { documentTypesFor, expiryDateError, filesError, isPhotoType, photoStageError } from "../../lib/documentRules";
import { PHOTO_STAGES } from "../../lib/workRules";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import FileUploadButton from "../ui/FileUploadButton";
import FormField from "../ui/FormField";
import LoadingState from "../ui/LoadingState";
import Notice from "../ui/Notice";
import Panel from "../ui/Panel";
import Select from "../ui/Select";
import { inputClasses } from "../ui/inputClasses";
import DeleteDocumentDialog from "./DeleteDocumentDialog";
import DocumentWarnings from "./DocumentWarnings";
import DocumentsTable from "./DocumentsTable";

interface Props {
  /** Registo a que os documentos pertencem: oportunidade, operação, obra, investimento, movimento ou imóvel. */
  owner: DocumentOwner;
  title?: string;
  /** Texto de ajuda no topo do separador. */
  notice?: ReactNode;
}

/** Separador "Documentos" de qualquer registo: avisos, carregamento e lista. Um só componente para toda a aplicação. */
function DocumentsPanel({ owner, title = "Documentos", notice }: Props) {
  const types = documentTypesFor(owner.kind);
  const documents = useDocuments({ ownerKind: owner.kind, ownerId: owner.id });
  const upload = useUploadDocuments();
  const [type, setType] = useState(types[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [photoStage, setPhotoStage] = useState("");
  const photo = isPhotoType(type);
  const [error, setError] = useState<string>();
  const [deleting, setDeleting] = useState<DocumentRecord | null>(null);

  const handleFiles = (files: File[]) => {
    const stage = photo ? photoStage : undefined;
    const invalid = filesError(files) ?? photoStageError(type, stage) ?? expiryDateError(expiryDate);
    setError(invalid);
    if (invalid) return;
    upload.mutate(
      { owner, type, expiryDate: expiryDate || undefined, photoStage: stage, files },
      {
        onSuccess: () => setExpiryDate(""),
        onError: (failure) => setError(failure instanceof ApiError && failure.status === 422 ? failure.message : "Não foi possível carregar os documentos. Tente novamente."),
      },
    );
  };

  return (
    <Panel className="overflow-hidden">
      {notice && (
        <div className="p-2.5 pb-0">
          <Notice>{notice}</Notice>
        </div>
      )}
      {documents.data && <DocumentWarnings kind={owner.kind} documents={documents.data} />}
      <div className="flex flex-col gap-2 border-b border-line px-3.5 py-3 min-[721px]:flex-row min-[721px]:items-end">
        <strong className="text-xs min-[721px]:mr-auto min-[721px]:self-center">{title}</strong>
        <FormField label="Tipo de documento" className="min-[721px]:w-48">
          <Select value={type} onChange={setType} options={types} />
        </FormField>
        {photo && (
          <FormField label="Fase da fotografia" className="min-[721px]:w-36">
            <Select value={photoStage} onChange={setPhotoStage} options={[...PHOTO_STAGES]} placeholder="Escolher…" />
          </FormField>
        )}
        <FormField label="Validade (opcional)" className="min-[721px]:w-40">
          <input type="date" className={inputClasses} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </FormField>
        <FileUploadButton label={upload.isPending ? "A carregar…" : "Carregar documentos"} multiple onFiles={handleFiles} />
      </div>
      {error && (
        <div role="alert" className="p-2.5">
          <Notice tone="warning">{error}</Notice>
        </div>
      )}
      {documents.isPending ? (
        <LoadingState />
      ) : documents.isError ? (
        <ErrorState onRetry={() => void documents.refetch()} />
      ) : documents.data.length ? (
        <DocumentsTable documents={documents.data} onDelete={setDeleting} />
      ) : (
        <EmptyState message="Ainda não há documentos." />
      )}
      {deleting && <DeleteDocumentDialog document={deleting} onClose={() => setDeleting(null)} />}
    </Panel>
  );
}

export default DocumentsPanel;
