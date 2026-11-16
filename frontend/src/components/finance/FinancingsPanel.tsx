import { useState } from "react";

import { useFinancings } from "../../hooks/useFinance";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import LoadingState from "../ui/LoadingState";
import Panel from "../ui/Panel";
import FinancingsTable from "./FinancingsTable";
import NewFinancingDrawer from "./NewFinancingDrawer";

/** Separador "Financiamentos": lista e criação. */
function FinancingsPanel() {
  const financings = useFinancings();
  const [creating, setCreating] = useState(false);
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3.5 py-3">
        <div>
          <strong className="text-xs">Financiamentos</strong>
          <p className="text-[11px] text-muted">Utilizado = entradas já associadas ao financiamento.</p>
        </div>
        <Button icon="plus" onClick={() => setCreating(true)}>
          Novo financiamento
        </Button>
      </div>
      {financings.isPending ? (
        <LoadingState />
      ) : financings.isError ? (
        <ErrorState onRetry={() => void financings.refetch()} />
      ) : financings.data.length ? (
        <FinancingsTable financings={financings.data} />
      ) : (
        <EmptyState message="Ainda não há financiamentos." />
      )}
      {creating && <NewFinancingDrawer onClose={() => setCreating(false)} />}
    </Panel>
  );
}

export default FinancingsPanel;
