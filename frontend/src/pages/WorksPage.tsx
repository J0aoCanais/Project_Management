import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import PageHeading from "../components/ui/PageHeading";
import Panel from "../components/ui/Panel";
import type { PillTone } from "../components/ui/Pill";
import SegmentedChoice from "../components/ui/SegmentedChoice";
import GanttChart, { type GanttRow } from "../components/works/GanttChart";
import NewWorkDrawer from "../components/works/NewWorkDrawer";
import WorkFilters from "../components/works/WorkFilters";
import WorksTable from "../components/works/WorksTable";
import WorkStats from "../components/works/WorkStats";
import { useWorkOptions, useWorks, useWorkStats } from "../hooks/useWorks";
import { todayIso } from "../lib/format";
import type { WorkState } from "../lib/workRules";

type WorksView = "lista" | "gantt";

const stateTones: Record<WorkState, PillTone> = {
  Planeada: "neutral",
  "Em curso": "amber",
  Concluída: "green",
  Atrasada: "red",
};

function WorksPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const view: WorksView = params.get("vista") === "gantt" ? "gantt" : "lista";
  const query = params.get("q") ?? "";
  const status = params.get("estado") ?? "";
  const operation = params.get("operacao") ?? "";

  const updateFilter = (key: "q" | "estado" | "operacao", value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const setView = (nextView: WorksView) => {
    const next = new URLSearchParams(params);
    if (nextView === "gantt") next.set("vista", "gantt");
    else next.delete("vista");
    setParams(next, { replace: true });
  };

  const clearFilters = () => {
    const next = new URLSearchParams(params);
    ["q", "estado", "operacao"].forEach((key) => next.delete(key));
    setParams(next, { replace: true });
  };

  const worksQuery = useWorks({ query, state: status, operation });
  const statsQuery = useWorkStats();
  const optionsQuery = useWorkOptions();

  const works = worksQuery.data ?? [];
  const today = todayIso();

  const ganttRows = useMemo<GanttRow[]>(
    () =>
      works.map((work) => {
        const planned =
          work.plannedStartDate && work.plannedEndDate
            ? ([work.plannedStartDate, work.plannedEndDate] as [string, string])
            : undefined;
        const realEnd =
          work.realEndDate ??
          (work.state === "Concluída"
            ? work.plannedEndDate ?? today
            : work.realStartDate && today >= work.realStartDate
              ? today
              : work.realStartDate);
        const real =
          work.realStartDate && realEnd
            ? ([work.realStartDate, realEnd] as [string, string])
            : undefined;
        return {
          id: work.id,
          label: work.name,
          sublabel: `${work.operationCode} · ${work.state}`,
          planned,
          real,
          realInProgress: Boolean(work.realStartDate && !work.realEndDate && work.state !== "Concluída"),
          tone: stateTones[work.state],
          href: `/obras/${work.id}`,
        };
      }),
    [works, today],
  );

  if ((worksQuery.isPending && !worksQuery.data) || (statsQuery.isPending && !statsQuery.data)) return <LoadingState />;
  if (worksQuery.isError || !worksQuery.data) {
    return <ErrorState onRetry={() => void worksQuery.refetch()} />;
  }

  const stats = statsQuery.data;
  const operationOptions = (optionsQuery.data?.operations ?? []).map((o) => o.code);
  const hasFilters = Boolean(query || status || operation);

  return (
    <div>
      <PageHeading
        title="Obras"
        actions={
          <Button variant="primary" icon="plus" onClick={() => setDrawerOpen(true)}>
            Nova obra
          </Button>
        }
      />

      {stats && <WorkStats stats={stats} />}

      <div className="mb-3 flex flex-col gap-2 min-[721px]:flex-row min-[721px]:items-start min-[721px]:justify-between">
        <SegmentedChoice
          label="Vista"
          value={view}
          onChange={setView}
          options={[
            { value: "lista", label: "Lista", icon: "list" },
            { value: "gantt", label: "Planeamento", icon: "chart" },
          ]}
        />
        <WorkFilters
          query={query}
          status={status}
          operation={operation}
          operationOptions={operationOptions}
          onChange={updateFilter}
        />
      </div>

      {works.length === 0 ? (
        <Panel className="overflow-hidden">
          <EmptyState
            message={
              hasFilters
                ? "Nenhuma obra corresponde aos filtros selecionados."
                : "Ainda não existem obras registadas."
            }
            action={
              hasFilters ? (
                <Button onClick={clearFilters}>Limpar filtros</Button>
              ) : (
                <Button variant="primary" icon="plus" onClick={() => setDrawerOpen(true)}>
                  Criar primeira obra
                </Button>
              )
            }
          />
        </Panel>
      ) : view === "gantt" ? (
        <GanttChart rows={ganttRows} today={today} />
      ) : (
        <Panel className="overflow-hidden">
          <WorksTable
            works={works}
            onRowClick={(work) =>
              navigate(`/obras/${work.id}`, {
                state: { listSearch: params.toString() ? `?${params.toString()}` : "" },
              })
            }
          />
        </Panel>
      )}

      {drawerOpen && <NewWorkDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}

export default WorksPage;
