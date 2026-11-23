import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { ApiError } from "../api/client";
import DocumentsPanel from "../components/documents/DocumentsPanel";
import MarkPaidDialog from "../components/finance/MarkPaidDialog";
import MovementFields from "../components/finance/MovementFields";
import MovementHeader from "../components/finance/MovementHeader";
import NewMovementDrawer from "../components/finance/NewMovementDrawer";
import ButtonLink from "../components/ui/ButtonLink";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import Tabs from "../components/ui/Tabs";
import { useMovement } from "../hooks/useFinance";

const tabs = [
  { value: "dados", label: "Dados" },
  { value: "documentos", label: "Documentos" },
] as const;

type TabValue = (typeof tabs)[number]["value"];

function MovementDetailPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { data, isPending, error, refetch } = useMovement(Number(id));
  const [open, setOpen] = useState<"edit" | "done" | null>(null);
  const tab: TabValue = tabs.find((item) => item.value === params.get("tab"))?.value ?? "dados";

  if (isPending) return <LoadingState />;
  if (error instanceof ApiError && error.status === 404) {
    return <EmptyState message="Este movimento não existe." action={<ButtonLink to="/financas">Voltar a finanças</ButtonLink>} />;
  }
  if (!data) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <>
      <MovementHeader movement={data} onEdit={() => setOpen("edit")} onMarkDone={() => setOpen("done")} />
      <Tabs label="Secções do movimento" tabs={[...tabs]} value={tab} onChange={(value) => setParams({ tab: value }, { replace: true })} />
      <div role="tabpanel">
        {tab === "dados" && <MovementFields movement={data} />}
        {tab === "documentos" && <DocumentsPanel owner={{ kind: "movement", id: data.id }} title="Documentos de suporte" />}
      </div>
      {open === "edit" && <NewMovementDrawer movement={data} onClose={() => setOpen(null)} />}
      {open === "done" && <MarkPaidDialog movement={data} onClose={() => setOpen(null)} />}
    </>
  );
}

export default MovementDetailPage;
