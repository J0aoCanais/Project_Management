import { useState } from "react";
import { useNavigate } from "react-router-dom";

import OperationCard from "../components/operations/OperationCard";
import NewOperationDrawer from "../components/operations/NewOperationDrawer";
import OperationsTable from "../components/operations/OperationsTable";
import PipelineBoard from "../components/pipeline/PipelineBoard";
import PipelineToolbar from "../components/pipeline/PipelineToolbar";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import Notice from "../components/ui/Notice";
import PageHeading from "../components/ui/PageHeading";
import Panel from "../components/ui/Panel";
import { useMoveOperationPhase, useOperationOptions, useOperations } from "../hooks/useOperations";
import { usePipelineFilters } from "../hooks/usePipelineFilters";
import { OPERATION_PHASES, OPPORTUNITY_PHASES } from "../lib/phases";
import { usePhases } from "../hooks/useSettings";

function OperationsPage() {
  const navigate = useNavigate();
  const { data: operations = [], isPending, isError, refetch } = useOperations();
  const { data: options } = useOperationOptions();
  const phasesQuery = usePhases();
  const filters = usePipelineFilters(operations, (operation) => `${operation.code} ${operation.title}`);
  const move = useMoveOperationPhase();
  const [creating, setCreating] = useState(false);
  const phases = OPERATION_PHASES.map((phase, index) => ({
    ...phase,
    maxDaysStalled: phasesQuery.data?.find((setting) => setting.position === index + OPPORTUNITY_PHASES.length + 1)?.maxDaysStalled ?? phase.maxDaysStalled,
  }));

  const handleMove = (id: number, phaseIndex: number) => {
    const operation = operations.find((item) => item.id === id);
    if (operation && operation.phaseIndex !== phaseIndex) move.mutate({ id, phaseIndex });
  };

  const renderContent = () => {
    if (isPending || phasesQuery.isPending) return <LoadingState />;
    if (isError || phasesQuery.isError) return <ErrorState onRetry={() => { void refetch(); void phasesQuery.refetch(); }} />;
    if (!operations.length) return <EmptyState message="Ainda não há operações. Converta uma oportunidade aprovada para começar." />;
    if (!filters.filtered.length) {
      return <EmptyState message="Nenhuma operação corresponde aos filtros." action={<Button onClick={filters.clear}>Limpar filtros</Button>} />;
    }
    if (filters.view === "lista") {
      return (
        <Panel className="overflow-hidden">
          <OperationsTable operations={filters.filtered} phases={phases} />
        </Panel>
      );
    }
    return (
      <PipelineBoard
        items={filters.filtered}
        phases={phases}
        startAt={9}
        getItemId={(operation) => String(operation.id)}
        getPhaseIndex={(operation) => operation.phaseIndex}
        renderCard={(operation) => <OperationCard operation={operation} phases={phases} onMove={(phaseIndex) => handleMove(operation.id, phaseIndex)} />}
        onMove={(itemId, phaseIndex) => handleMove(Number(itemId), phaseIndex)}
      />
    );
  };

  return (
    <>
      <PageHeading title="Operações" actions={<Button variant="primary" icon="plus" onClick={() => setCreating(true)}>Nova operação</Button>} />
      <PipelineToolbar
        filters={filters}
        zones={options?.zones ?? []}
        managers={options?.managers ?? []}
        searchPlaceholder="Pesquisar operações..."
      />
      {move.isError && (
        <div role="alert" className="mb-3">
          <Notice tone="warning">Não foi possível mudar a fase. A operação voltou à fase anterior.</Notice>
        </div>
      )}
      {renderContent()}
      {creating && (
        <NewOperationDrawer
          onClose={() => setCreating(false)}
          onCreated={(id) => {
            setCreating(false);
            navigate(`/operacoes/${id}`);
          }}
        />
      )}
    </>
  );
}

export default OperationsPage;
