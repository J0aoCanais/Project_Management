import { useState } from "react";

import type { DocumentRecord } from "../api/documentsApi";
import DeleteDocumentDialog from "../components/documents/DeleteDocumentDialog";
import DocumentFilters from "../components/documents/DocumentFilters";
import DocumentsTable from "../components/documents/DocumentsTable";
import UploadDocumentDrawer from "../components/documents/UploadDocumentDrawer";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import PageHeading from "../components/ui/PageHeading";
import Panel from "../components/ui/Panel";
import { useDocuments } from "../hooks/useDocuments";
import { useUrlFilters } from "../hooks/useUrlFilters";
import { OWNER_KINDS, OWNER_KIND_LABELS, documentTypesFor, ownerKindFromLabel } from "../lib/documentRules";

const FILTER_KEYS = ["q", "tipo", "associado"] as const;
const ownerLabels = OWNER_KINDS.map((kind) => OWNER_KIND_LABELS[kind]);
/** Todos os tipos de documento, sem repetidos, para o filtro. */
const allTypes = [...new Set(OWNER_KINDS.flatMap(documentTypesFor))].sort((a, b) => a.localeCompare(b, "pt"));

function DocumentsPage() {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<DocumentRecord | null>(null);
  const { values, set, clear, active } = useUrlFilters(FILTER_KEYS);
  const documents = useDocuments({ q: values.q || undefined, type: values.tipo || undefined, ownerKind: ownerKindFromLabel(values.associado) });

  return (
    <div>
      <PageHeading
        title="Documentos"
        actions={
          <Button variant="primary" icon="upload" onClick={() => setUploading(true)}>
            Carregar documento
          </Button>
        }
      />
      <DocumentFilters query={values.q} type={values.tipo} owner={values.associado} types={allTypes} owners={ownerLabels} onChange={set} />
      <Panel className="overflow-hidden">
        {documents.isPending ? (
          <LoadingState />
        ) : documents.isError ? (
          <ErrorState onRetry={() => void documents.refetch()} />
        ) : documents.data.length ? (
          <DocumentsTable documents={documents.data} showOwner onDelete={setDeleting} />
        ) : active ? (
          <EmptyState message="Nenhum documento corresponde aos filtros." action={<Button onClick={clear}>Limpar filtros</Button>} />
        ) : (
          <EmptyState message="Ainda não há documentos carregados." action={<Button onClick={() => setUploading(true)}>Carregar o primeiro documento</Button>} />
        )}
      </Panel>
      {uploading && <UploadDocumentDrawer onClose={() => setUploading(false)} />}
      {deleting && <DeleteDocumentDialog document={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}

export default DocumentsPage;
