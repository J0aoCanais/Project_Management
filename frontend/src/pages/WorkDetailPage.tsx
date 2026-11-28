import { useMemo, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";

import { ApiError } from "../api/client";
import type { BudgetItem, WorkDetail } from "../api/worksApi";
import DocumentsPanel from "../components/documents/DocumentsPanel";
import Button from "../components/ui/Button";
import ButtonLink from "../components/ui/ButtonLink";
import Drawer from "../components/ui/Drawer";
import EmptyState from "../components/ui/EmptyState";
import EntityHeader from "../components/ui/EntityHeader";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import Panel from "../components/ui/Panel";
import Pill, { type PillTone } from "../components/ui/Pill";
import Tabs from "../components/ui/Tabs";
import BudgetTable from "../components/works/BudgetTable";
import GanttChart, { type GanttRow } from "../components/works/GanttChart";
import PlanningBar from "../components/works/PlanningBar";
import WorkActions from "../components/works/WorkActions";
import WorkForm from "../components/works/WorkForm";
import WorkSummary from "../components/works/WorkSummary";
import {
  useMarkWorkCompleted,
  useUpdateWork,
  useWork,
} from "../hooks/useWorks";
import { formatIsoDate, todayIso } from "../lib/format";
import {
  type WorkFormValues,
  type WorkState,
} from "../lib/workRules";

const tabs = [
  { value: "resumo", label: "Resumo" },
  { value: "orcamento", label: "Orçamento" },
  { value: "planeamento", label: "Planeamento" },
  { value: "documentos", label: "Documentos" },
] as const;

type TabValue = (typeof tabs)[number]["value"];

const stateTones: Record<WorkState, PillTone> = {
  Planeada: "neutral",
  "Em curso": "amber",
  Concluída: "green",
  Atrasada: "red",
};

function budgetItemTone(item: BudgetItem, work: WorkDetail, today: string): PillTone {
  if (item.realEndDate && item.plannedEndDate && item.realEndDate > item.plannedEndDate) return "red";
  if (!item.realEndDate && item.plannedEndDate && today > item.plannedEndDate && work.state !== "Concluída") {
    return "red";
  }
  if (item.realEndDate || (item.contractedValue > 0 && item.executedValue >= item.contractedValue)) {
    return "green";
  }
  if (item.realStartDate || item.executedValue > 0) return "amber";
  return "neutral";
}

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

  const tab = tabs.find((item) => item.value === params.get("tab"))?.value ?? "resumo";
  const today = todayIso();

  const budgetGanttRows = useMemo<GanttRow[]>(() => {
    if (!work) return [];
    return work.budgetItems.map((item) => {
      const planned =
        item.plannedStartDate && item.plannedEndDate
          ? ([item.plannedStartDate, item.plannedEndDate] as [string, string])
          : undefined;
      const realEnd =
        item.realEndDate ??
        (work.state === "Concluída"
          ? work.realEndDate ?? item.plannedEndDate ?? today
          : item.realStartDate && today >= item.realStartDate
            ? today
            : item.realStartDate);
      const real =
        item.realStartDate && realEnd
          ? ([item.realStartDate, realEnd] as [string, string])
          : undefined;

      return {
        id: item.id,
        label: item.categoryName,
        sublabel: item.contractorName,
        planned,
        real,
        realInProgress: Boolean(item.realStartDate && !item.realEndDate && work.state !== "Concluída"),
        tone: budgetItemTone(item, work, today),
      };
    });
  }, [work, today]);

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

  return (
    <>
      <EntityHeader
        title={work.name}
        type="Obra"
        backTo={backTo}
        meta={
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Pill tone={stateTones[work.state]}>{work.state}</Pill>
              <span className="text-muted">·</span>
              <Link to={`/operacoes/${work.operationId}`} className="text-brand hover:underline">
                {work.operationCode} · {work.operationName}
              </Link>
            </div>
            <PlanningBar work={work} today={today} />
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
        {tab === "planeamento" && (
          <div className="grid min-w-0 gap-3.5">
            <Panel className="p-3.5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xs font-bold text-ink">Planeamento da obra</h2>
                {work.plannedStartDate && work.plannedEndDate && (
                  <span className="text-[11px] text-muted">
                    {formatIsoDate(work.plannedStartDate)} → {formatIsoDate(work.plannedEndDate)}
                  </span>
                )}
              </div>
              <PlanningBar work={work} today={today} />
            </Panel>
            <GanttChart
              rows={budgetGanttRows}
              today={today}
              emptyMessage="Nenhum item do orçamento tem datas definidas. Edite os itens no separador Orçamento ou importe um ficheiro Excel com datas."
            />
          </div>
        )}
        {tab === "documentos" && (
          <DocumentsPanel
            owner={{ kind: "work", id: work.id }}
            title="Documentos da obra"
            notice="Orçamentos, plantas, licenças e fotografias da obra (antes, durante e depois). Aparecem também no menu Documentos."
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
