import { useState, type FormEvent } from "react";

import { useLeadSourcesAdmin, useSaveLeadSource } from "../../hooks/useSettings";
import { leadSourceNameError, SETTINGS_LIMITS } from "../../lib/settingsRules";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import FormField from "../ui/FormField";
import LoadingState from "../ui/LoadingState";
import Notice from "../ui/Notice";
import Panel from "../ui/Panel";
import PanelHeader from "../ui/PanelHeader";
import Pill from "../ui/Pill";
import Table, { type TableColumn } from "../ui/Table";
import { inputClasses } from "../ui/inputClasses";

function LeadSourcesPanel() {
  const query = useLeadSourcesAdmin();
  const save = useSaveLeadSource();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const error = leadSourceNameError(name);

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} />;
  if (!query.data?.length) return <EmptyState message="Ainda não há origens de lead." />;

  const columns: TableColumn<(typeof query.data)[number]>[] = [
    { key: "name", header: "Nome", render: (source) => source.name },
    { key: "active", header: "Estado", render: (source) => <Pill tone={source.isActive ? "green" : "neutral"}>{source.isActive ? "Ativa" : "Inativa"}</Pill> },
    {
      key: "actions",
      header: "Ações",
      render: (source) => (
        <Button
          disabled={save.isPending}
          onClick={() => save.mutate({ id: source.id, input: { isActive: !source.isActive } })}
        >
          {source.isActive ? "Desativar" : "Ativar"}
        </Button>
      ),
    },
  ];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (error) return;
    save.mutate({ input: { name: name.trim() } }, { onSuccess: () => { setName(""); setCreating(false); setSubmitted(false); } });
  };

  return (
    <>
      <Panel className="overflow-hidden">
        <PanelHeader title="Origens de lead" action={<Button variant="primary" icon="plus" onClick={() => setCreating(true)}>Nova origem</Button>} />
        {save.isError && !creating && <div role="alert" className="p-3"><Notice tone="warning">Não foi possível guardar a origem.</Notice></div>}
        <div className="pt-2">
          <Table columns={columns} rows={query.data} getRowKey={(source) => source.id} />
        </div>
      </Panel>
      {creating && (
        <Drawer
          title="Nova origem de lead"
          onClose={() => setCreating(false)}
          footer={
            <>
              <Button onClick={() => setCreating(false)}>Cancelar</Button>
              <Button variant="primary" type="submit" form="nova-origem" disabled={save.isPending}>Criar origem</Button>
            </>
          }
        >
          <form id="nova-origem" noValidate onSubmit={submit} className="grid gap-3">
            {save.isError && <Notice tone="warning">Não foi possível criar a origem. O nome pode já estar a ser utilizado.</Notice>}
            <FormField label="Nome" error={submitted ? error : undefined}>
              <input className={inputClasses} autoFocus value={name} maxLength={SETTINGS_LIMITS.leadSourceName} onChange={(event) => setName(event.target.value)} />
            </FormField>
          </form>
        </Drawer>
      )}
    </>
  );
}

export default LeadSourcesPanel;
