import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import PageHeading from "../components/ui/PageHeading";
import Panel from "../components/ui/Panel";
import NewWorkDrawer from "../components/works/NewWorkDrawer";
import WorkFilters from "../components/works/WorkFilters";
import WorksTable from "../components/works/WorksTable";
import WorkStats from "../components/works/WorkStats";
import { useWorkOptions, useWorks, useWorkStats } from "../hooks/useWorks";

function WorksPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const query = params.get("q") ?? "";
  const status = params.get("estado") ?? "";
  const operation = params.get("operacao") ?? "";

  const updateFilter = (key: "q" | "estado" | "operacao", value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const clearFilters = () => setParams({});

  const worksQuery = useWorks({ query, state: status, operation });
  const statsQuery = useWorkStats();
  const optionsQuery = useWorkOptions();

  if (worksQuery.isPending || statsQuery.isPending) return <LoadingState />;
  if (worksQuery.isError || !worksQuery.data) {
    return <ErrorState onRetry={() => void worksQuery.refetch()} />;
  }

  const works = worksQuery.data;
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

      <WorkFilters
        query={query}
        status={status}
        operation={operation}
        operationOptions={operationOptions}
        onChange={updateFilter}
      />

      <Panel className="overflow-hidden">
        {works.length > 0 ? (
          <WorksTable
            works={works}
            onRowClick={(work) =>
              navigate(`/obras/${work.id}${params.toString() ? `?${params.toString()}` : ""}`)
            }
          />
        ) : (
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
        )}
      </Panel>

      {drawerOpen && <NewWorkDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}

export default WorksPage;
