import { useState } from "react";

import NewOpportunityDrawer from "../components/opportunities/NewOpportunityDrawer";
import PhaseNoteDialog from "../components/opportunities/PhaseNoteDialog";
import OpportunitiesTable from "../components/opportunities/OpportunitiesTable";
import OpportunityBoard from "../components/opportunities/OpportunityBoard";
import OpportunityToolbar from "../components/opportunities/OpportunityToolbar";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import Notice from "../components/ui/Notice";
import PageHeading from "../components/ui/PageHeading";
import Panel from "../components/ui/Panel";
import { useMoveOpportunityPhase, useOpportunities } from "../hooks/useOpportunities";
import { useOpportunityFilters } from "../hooks/useOpportunityFilters";
import { OPPORTUNITY_PHASES } from "../lib/phases";
import { usePhases } from "../hooks/useSettings";

function OpportunitiesPage() {
  const { data: cards = [], isPending, isError, refetch } = useOpportunities();
  const phasesQuery = usePhases();
  const filters = useOpportunityFilters(cards);
  const move = useMoveOpportunityPhase();
  const [creating, setCreating] = useState(false);
  /** Mudança de fase à espera da nota (opcional) no Dialog. */
  const [pendingMove, setPendingMove] = useState<{ id: number; from: number; to: number } | null>(null);
  const phases = OPPORTUNITY_PHASES.map((phase, index) => ({
    ...phase,
    maxDaysStalled: phasesQuery.data?.find((setting) => setting.position === index + 1)?.maxDaysStalled ?? phase.maxDaysStalled,
  }));

  const handleMove = (id: number, phaseIndex: number) => {
    // Largar na mesma coluna, ou largar algo que não é um cartão, não muda nada.
    const card = cards.find((item) => item.id === id);
    if (card && card.phaseIndex !== phaseIndex) setPendingMove({ id, from: card.phaseIndex, to: phaseIndex });
  };

  const newButton = (
    <Button variant="primary" icon="plus" onClick={() => setCreating(true)}>
      Nova oportunidade
    </Button>
  );

  const renderContent = () => {
    if (isPending || phasesQuery.isPending) return <LoadingState />;
    if (isError || phasesQuery.isError) return <ErrorState onRetry={() => { void refetch(); void phasesQuery.refetch(); }} />;
    if (!cards.length) return <EmptyState message="Ainda não há oportunidades. Crie a primeira para começar o pipeline." />;
    if (!filters.filtered.length) {
      return <EmptyState message="Nenhuma oportunidade corresponde aos filtros." action={<Button onClick={filters.clear}>Limpar filtros</Button>} />;
    }
    if (filters.view === "lista") {
      return (
        <Panel className="overflow-hidden">
          <OpportunitiesTable cards={filters.filtered} phases={phases} />
        </Panel>
      );
    }
    return <OpportunityBoard cards={filters.filtered} phases={phases} onMove={handleMove} />;
  };

  return (
    <>
      <PageHeading title="Oportunidades" actions={newButton} />
      <OpportunityToolbar filters={filters} />
      {move.isError && (
        <div role="alert" className="mb-3">
          <Notice tone="warning">Não foi possível mudar a fase. A oportunidade voltou à fase anterior.</Notice>
        </div>
      )}
      {renderContent()}
      {creating && <NewOpportunityDrawer onClose={() => setCreating(false)} />}
      {pendingMove && (
        <PhaseNoteDialog
          title="Mudar de fase"
          description={`${phases[pendingMove.from].name} → ${phases[pendingMove.to].name}`}
          confirmLabel="Mudar de fase"
          onClose={() => setPendingMove(null)}
          onConfirm={(note) => {
            move.mutate({ id: pendingMove.id, phaseIndex: pendingMove.to, note });
            setPendingMove(null);
          }}
        />
      )}
    </>
  );
}

export default OpportunitiesPage;
