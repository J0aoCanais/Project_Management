import { useState } from "react";

import type { Movement, MovementDirection, MovementStatus } from "../api/financeApi";
import FinanceStats from "../components/finance/FinanceStats";
import FinancingsPanel from "../components/finance/FinancingsPanel";
import ForecastChart from "../components/finance/ForecastChart";
import MarkPaidDialog from "../components/finance/MarkPaidDialog";
import MovementFilters, { type MovementFilterKey } from "../components/finance/MovementFilters";
import MovementsTable from "../components/finance/MovementsTable";
import NewMovementDrawer from "../components/finance/NewMovementDrawer";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import PageHeading from "../components/ui/PageHeading";
import Panel from "../components/ui/Panel";
import Tabs from "../components/ui/Tabs";
import { useMovementOptions, useMovements } from "../hooks/useFinance";
import { useUrlFilters } from "../hooks/useUrlFilters";

const tabs = [
  { value: "movimentos", label: "Movimentos" },
  { value: "previsto", label: "Previsto vs. realizado" },
  { value: "financiamentos", label: "Financiamentos" },
] as const;

type TabValue = (typeof tabs)[number]["value"];

const TAB_KEY = ["tab"] as const;
const MOVEMENT_FILTERS: MovementFilterKey[] = ["q", "categoria", "direcao", "estado", "operacao"];

function FinancePage() {
  const { values, set, clear, active: filtering } = useUrlFilters(MOVEMENT_FILTERS);
  const tabParam = useUrlFilters(TAB_KEY);
  const tab: TabValue = tabs.find((item) => item.value === tabParam.values.tab)?.value ?? "movimentos";
  const options = useMovementOptions();
  const movements = useMovements({
    q: values.q || undefined,
    category: values.categoria || undefined,
    direction: (values.direcao || undefined) as MovementDirection | undefined,
    status: (values.estado || undefined) as MovementStatus | undefined,
    operation: values.operacao || undefined,
  });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Movement | null>(null);
  const [paying, setPaying] = useState<Movement | null>(null);

  return (
    <div>
      <PageHeading
        title="Finanças"
        actions={
          <Button variant="primary" icon="plus" onClick={() => setCreating(true)}>
            Novo movimento
          </Button>
        }
      />
      {tab !== "financiamentos" && <MovementFilters values={values} options={options.data} onChange={set} />}
      {movements.data && tab !== "financiamentos" && <FinanceStats movements={movements.data} />}
      <Tabs label="Secções de finanças" tabs={[...tabs]} value={tab} onChange={(value) => tabParam.set("tab", value === "movimentos" ? "" : value)} />

      <div role="tabpanel">
        {tab === "financiamentos" ? (
          <FinancingsPanel />
        ) : movements.isPending ? (
          <LoadingState />
        ) : movements.isError ? (
          <ErrorState onRetry={() => void movements.refetch()} />
        ) : tab === "previsto" ? (
          <ForecastChart movements={movements.data} />
        ) : (
          <Panel className="overflow-hidden">
            {movements.data.length ? (
              <MovementsTable movements={movements.data} onMarkDone={setPaying} onEdit={setEditing} />
            ) : filtering ? (
              <EmptyState message="Nenhum movimento corresponde aos filtros." action={<Button onClick={clear}>Limpar filtros</Button>} />
            ) : (
              <EmptyState message="Ainda não há movimentos." action={<Button onClick={() => setCreating(true)}>Registar o primeiro movimento</Button>} />
            )}
          </Panel>
        )}
      </div>

      {creating && <NewMovementDrawer onClose={() => setCreating(false)} />}
      {editing && <NewMovementDrawer movement={editing} onClose={() => setEditing(null)} />}
      {paying && <MarkPaidDialog movement={paying} onClose={() => setPaying(null)} />}
    </div>
  );
}

export default FinancePage;
