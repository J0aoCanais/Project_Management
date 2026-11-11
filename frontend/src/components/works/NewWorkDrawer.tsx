import { useState } from "react";

import type { WorkDetail } from "../../api/worksApi";
import { useCreateWork } from "../../hooks/useWorks";
import type { WorkFormValues } from "../../lib/workRules";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import WorkForm from "./WorkForm";

interface Props {
  onClose: () => void;
  onCreated?: (work: WorkDetail) => void;
}

const FORM_ID = "nova-obra-form";

function NewWorkDrawer({ onClose, onCreated }: Props) {
  const create = useCreateWork();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = (values: WorkFormValues) => {
    setServerError(null);
    create.mutate(
      {
        name: values.name,
        operationId: Number(values.operationId),
        state: values.state,
        plannedStartDate: values.plannedStartDate,
        plannedEndDate: values.plannedEndDate,
        notes: values.notes,
      },
      {
        onSuccess: (work) => {
          if (onCreated) onCreated(work);
          else onClose();
        },
        onError: (err) => {
          setServerError(err instanceof Error ? err.message : "Não foi possível criar a obra.");
        },
      },
    );
  };

  return (
    <Drawer
      title="Nova obra"
      subtitle="Planeamento e calendarização de obra"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={create.isPending}>
            Criar obra
          </Button>
        </>
      }
    >
      <WorkForm
        formId={FORM_ID}
        onSubmit={handleSubmit}
        isSubmitting={create.isPending}
        serverError={serverError}
      />
    </Drawer>
  );
}

export default NewWorkDrawer;
