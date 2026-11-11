import { useState, type FormEvent } from "react";

import type { MovementCategoryInput } from "../../api/settingsApi";
import { useMovementCategories, useSaveMovementCategory } from "../../hooks/useSettings";
import { movementCategoryErrors, SETTINGS_LIMITS } from "../../lib/settingsRules";
import { movementDirections } from "../../temp";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import FormField from "../ui/FormField";
import LoadingState from "../ui/LoadingState";
import Notice from "../ui/Notice";
import Panel from "../ui/Panel";
import PanelHeader from "../ui/PanelHeader";
import Select from "../ui/Select";
import Table, { type TableColumn } from "../ui/Table";
import { inputClasses } from "../ui/inputClasses";

function MovementCategoriesPanel() {
  const query = useMovementCategories();
  const save = useSaveMovementCategory();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [direction, setDirection] = useState<MovementCategoryInput["direction"]>("Entrada");
  const [submitted, setSubmitted] = useState(false);
  const errors = movementCategoryErrors({ name, direction });

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} />;
  if (!query.data?.length) return <EmptyState message="Ainda não há categorias de movimento." />;

  const columns: TableColumn<(typeof query.data)[number]>[] = [
    { key: "name", header: "Nome", render: (category) => category.name },
    { key: "direction", header: "Direção", render: (category) => category.direction },
  ];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    save.mutate({ name: name.trim(), direction }, { onSuccess: () => { setName(""); setCreating(false); setSubmitted(false); } });
  };

  return (
    <>
      <Panel className="overflow-hidden">
        <PanelHeader title="Categorias de movimento" action={<Button variant="primary" icon="plus" onClick={() => setCreating(true)}>Nova categoria</Button>} />
        {save.isError && !creating && <div role="alert" className="p-3"><Notice tone="warning">Não foi possível guardar a categoria.</Notice></div>}
        <div className="pt-2">
          <Table columns={columns} rows={query.data} getRowKey={(category) => category.id} />
        </div>
      </Panel>
      {creating && (
        <Drawer
          title="Nova categoria de movimento"
          onClose={() => setCreating(false)}
          footer={
            <>
              <Button onClick={() => setCreating(false)}>Cancelar</Button>
              <Button variant="primary" type="submit" form="nova-categoria-movimento" disabled={save.isPending}>Criar categoria</Button>
            </>
          }
        >
          <form id="nova-categoria-movimento" noValidate onSubmit={submit} className="grid gap-3">
            {save.isError && <Notice tone="warning">Não foi possível criar a categoria. O nome pode já estar a ser utilizado.</Notice>}
            <FormField label="Nome" error={submitted ? errors.name : undefined}>
              <input className={inputClasses} autoFocus value={name} maxLength={SETTINGS_LIMITS.movementCategoryName} onChange={(event) => setName(event.target.value)} />
            </FormField>
            <FormField label="Direção" error={submitted ? errors.direction : undefined}>
              <Select value={direction} onChange={(value) => setDirection(value as MovementCategoryInput["direction"])} options={[...movementDirections]} />
            </FormField>
          </form>
        </Drawer>
      )}
    </>
  );
}

export default MovementCategoriesPanel;
