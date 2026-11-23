import { useState } from "react";

import { usePhases, useUpdatePhase } from "../../hooks/useSettings";
import { DEFAULT_MAX_DAYS_STALLED } from "../../lib/phases";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import FormField from "../ui/FormField";
import LoadingState from "../ui/LoadingState";
import Notice from "../ui/Notice";
import NumberInput from "../ui/NumberInput";
import Panel from "../ui/Panel";
import Table, { type TableColumn } from "../ui/Table";

function PhasesPanel() {
  const query = usePhases();
  const update = useUpdatePhase();
  const [drafts, setDrafts] = useState<Record<number, number>>({});

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} />;
  if (!query.data?.length) return <EmptyState message="Ainda não há fases configuradas." />;

  const columns: TableColumn<(typeof query.data)[number]>[] = [
    { key: "position", header: "Posição", render: (phase) => phase.position },
    { key: "name", header: "Fase", render: (phase) => phase.name },
    {
      key: "maxDays",
      header: "Dias máximos parado",
      render: (phase) => (
        <FormField label={`Dias máximos parado em ${phase.name}`}>
          <NumberInput
            className="max-w-[150px]"
            min={0}
            max={365}
            decimals={0}
            suffix="dias"
            value={drafts[phase.id] ?? phase.maxDaysStalled}
            onChange={(value) => setDrafts((previous) => ({ ...previous, [phase.id]: value }))}
            onBlur={() => {
              const value = drafts[phase.id] ?? phase.maxDaysStalled;
              const savedValue = value === 0 ? DEFAULT_MAX_DAYS_STALLED : value;
              const clearDraft = () => setDrafts((previous) => {
                const next = { ...previous };
                delete next[phase.id];
                return next;
              });
              if (savedValue === phase.maxDaysStalled) clearDraft();
              else update.mutate({ id: phase.id, maxDaysStalled: savedValue }, { onSuccess: clearDraft });
            }}
          />
        </FormField>
      ),
    },
  ];

  return (
    <Panel className="overflow-hidden">
      {update.isError && <div role="alert" className="p-3"><Notice tone="warning">Indique um número inteiro entre 1 e 365 dias.</Notice></div>}
      <div className="p-3 text-[11px] text-muted">Os nomes e a ordem das fases são fixos. Sem configuração, o limite por omissão é {DEFAULT_MAX_DAYS_STALLED} dias; deixe o campo vazio para repor.</div>
      <Table columns={columns} rows={query.data} getRowKey={(phase) => phase.id} />
    </Panel>
  );
}

export default PhasesPanel;
