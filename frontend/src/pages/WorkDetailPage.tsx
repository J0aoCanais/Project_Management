import { useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";

import { ApiError } from "../api/client";
import DocumentsPanel from "../components/documents/DocumentsPanel";
import Button from "../components/ui/Button";
import ButtonLink from "../components/ui/ButtonLink";
import Drawer from "../components/ui/Drawer";
import EmptyState from "../components/ui/EmptyState";
import EntityHeader from "../components/ui/EntityHeader";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import Pill, { type PillTone } from "../components/ui/Pill";
import Tabs from "../components/ui/Tabs";
import BudgetTable from "../components/works/BudgetTable";
import WorkActions from "../components/works/WorkActions";
import WorkForm from "../components/works/WorkForm";
import WorkSummary from "../components/works/WorkSummary";
import {
  useMarkWorkCompleted,
  useUpdateWork,
  useUploadWorkDocuments,
  useWork,
} from "../hooks/useWorks";
import {
  PHOTO_STAGES,
  WORK_DOCUMENT_TYPES,
  type PhotoStage,
  type WorkFormValues,
  type WorkState,
} from "../lib/workRules";

const tabs = [
  { value: "resumo", label: "Resumo" },
  { value: "orcamento", label: "Orçamento" },
  { value: "documentos", label: "Documentos" },
] as const;

type TabValue = (typeof tabs)[number]["value"];

const stateTones: Record<WorkState, PillTone> = {
  Planeada: "neutral",
  "Em curso": "amber",
  Concluída: "green",
  Atrasada: "red",
};

const EDIT_FORM_ID = "edit-work-form";

function WorkDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [params, setParams] = useSearchParams();

  const [backTo] = useState(
    () => `/obras${(location.state as { listSearch?: string } | null)?.listSearch ?? ""}`,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const workId = Number(id);
  const { data: work, isPending, error, refetch } = useWork(workId);
  const updateMutation = useUpdateWork(workId);
  const markCompletedMutation = useMarkWorkCompleted();
  const uploadDocumentsMutation = useUploadWorkDocuments(workId);

  const tab = tabs.find((item) => item.value === params.get("tab"))?.value ?? "resumo";

  const handleTabChange = (value: TabValue) => {
    setParams({ tab: value }, { replace: true });
  };

  if (isPending) return <LoadingState />;
  if (error instanceof ApiError && error.status === 404) {
    return (
      <EmptyState
        message="Esta obra não existe."
        action={<ButtonLink to="/obras">Voltar a obras</ButtonLink>}
      />
    );
  }
  if (!work) return <ErrorState onRetry={() => void refetch()} />;

  const handleEditSubmit = (values: WorkFormValues) => {
    setEditError(null);
    updateMutation.mutate(
      {
        id: work.id,
        input: {
          name: values.name,
          operationId: Number(values.operationId),
          state: values.state,
          plannedStartDate: values.plannedStartDate,
          plannedEndDate: values.plannedEndDate,
          realStartDate: values.realStartDate,
          realEndDate: values.realEndDate,
          notes: values.notes,
        },
      },
      {
        onSuccess: () => setIsEditing(false),
        onError: (err) => {
          setEditError(err instanceof Error ? err.message : "Não foi possível atualizar a obra.");
        },
      },
    );
  };

  const handleMarkCompleted = () => {
    markCompletedMutation.mutate(work.id);
  };

  const handleUpload = (files: File[], type: string, photoStage?: string) => {
    uploadDocumentsMutation.mutate({
      files,
      type,
      photoStage: photoStage as PhotoStage | undefined,
    });
  };

  return (
    <>
      <EntityHeader
        title={work.name}
        type="Obra"
        backTo={backTo}
        meta={
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Pill tone={stateTones[work.state]}>{work.state}</Pill>
            <span className="text-muted">·</span>
            <Link to={`/operacoes/${work.operationId}`} className="text-brand hover:underline">
              {work.operationCode} · {work.operationName}
            </Link>
          </div>
        }
        actions={
          <WorkActions
            work={work}
            onEdit={() => setIsEditing(true)}
            onMarkCompleted={handleMarkCompleted}
            isPending={markCompletedMutation.isPending}
          />
        }
      />

      <Tabs label="Secções da obra" tabs={[...tabs]} value={tab} onChange={handleTabChange} />

      <div role="tabpanel">
        {tab === "resumo" && <WorkSummary work={work} />}
        {tab === "orcamento" && <BudgetTable work={work} />}
        {tab === "documentos" && (
          <DocumentsPanel
            title="Documentos da obra"
            types={[...WORK_DOCUMENT_TYPES]}
            photoStages={[...PHOTO_STAGES]}
            documents={work.documents}
            onUpload={handleUpload}
            isUploading={uploadDocumentsMutation.isPending}
            uploadFailed={uploadDocumentsMutation.isError}
            emptyMessage="Ainda não existem documentos associados a esta obra."
          />
        )}
      </div>

      {isEditing && (
        <Drawer
          title="Editar obra"
          subtitle={`Atualizar dados de ${work.name}`}
          onClose={() => setIsEditing(false)}
          footer={
            <>
              <Button onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button
                variant="primary"
                type="submit"
                form={EDIT_FORM_ID}
                disabled={updateMutation.isPending}
              >
                Guardar alterações
              </Button>
            </>
          }
        >
          <WorkForm
            formId={EDIT_FORM_ID}
            initialValues={{
              name: work.name,
              operationId: work.operationId,
              state: work.state,
              plannedStartDate: work.plannedStartDate,
              plannedEndDate: work.plannedEndDate,
              realStartDate: work.realStartDate,
              realEndDate: work.realEndDate,
              notes: work.notes,
            }}
            isEdit
            onSubmit={handleEditSubmit}
            serverError={editError}
          />
        </Drawer>
      )}
    </>
  );
}

export default WorkDetailPage;
