import { useState } from "react";

import type { BudgetItem } from "../../api/worksApi";
import { useSaveBudgetItem } from "../../hooks/useWorks";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import BudgetItemForm from "./BudgetItemForm";

interface Props {
  workId: number;
  itemToEdit?: BudgetItem | null;
  onClose: () => void;
}

const FORM_ID = "budget-item-drawer-form";

function NewBudgetItemDrawer({ workId, itemToEdit, onClose }: Props) {
  const save = useSaveBudgetItem(workId);
  const [serverError, setServerError] = useState<string | null>(null);

  const isEditing = Boolean(itemToEdit);

  const handleSubmit = (item: Omit<BudgetItem, "id"> & { id?: string }) => {
    setServerError(null);
    save.mutate(item, {
      onSuccess: () => onClose(),
      onError: (err) => {
        setServerError(err instanceof Error ? err.message : "Não foi possível guardar a categoria de orçamento.");
      },
    });
  };

  return (
    <Drawer
      title={isEditing ? "Editar categoria de orçamento" : "Nova categoria de orçamento"}
      subtitle={isEditing ? `Editar valores de ${itemToEdit?.categoryName}` : "Adicionar rúbrica ao orçamento da obra"}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={save.isPending}>
            {isEditing ? "Guardar alterações" : "Adicionar categoria"}
          </Button>
        </>
      }
    >
      <BudgetItemForm
        formId={FORM_ID}
        initialValues={itemToEdit ?? undefined}
        onSubmit={handleSubmit}
        serverError={serverError}
      />
    </Drawer>
  );
}

export default NewBudgetItemDrawer;
