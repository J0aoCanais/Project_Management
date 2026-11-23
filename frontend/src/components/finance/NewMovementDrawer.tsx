import { ApiError } from "../../api/client";
import type { Movement, MovementInput } from "../../api/financeApi";
import { useCreateMovement, useMovementOptions, useUpdateMovement } from "../../hooks/useFinance";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import ErrorState from "../ui/ErrorState";
import LoadingState from "../ui/LoadingState";
import MovementForm from "./MovementForm";

interface Props {
  onClose: () => void;
  /** Com um movimento, o drawer edita-o em vez de criar um novo. */
  movement?: Movement;
}

const FORM_ID = "movimento";

function NewMovementDrawer({ onClose, movement }: Props) {
  const options = useMovementOptions();
  const create = useCreateMovement();
  const update = useUpdateMovement(movement?.id ?? 0);
  const mutation = movement ? update : create;
  const serverError = mutation.error
    ? mutation.error instanceof ApiError && mutation.error.status === 422
      ? mutation.error.message
      : "Não foi possível guardar o movimento. Tente novamente."
    : undefined;

  const handleSubmit = (input: MovementInput) => {
    if (movement) update.mutate(input, { onSuccess: onClose });
    else create.mutate(input, { onSuccess: onClose });
  };

  return (
    <Drawer
      title={movement ? "Editar movimento" : "Novo movimento"}
      subtitle={movement ? `${movement.category} · ${movement.direction}` : "Entrada ou saída prevista ou realizada"}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={mutation.isPending || !options.data}>
            {movement ? "Guardar alterações" : "Criar movimento"}
          </Button>
        </>
      }
    >
      {options.isPending ? (
        <LoadingState />
      ) : options.isError ? (
        <ErrorState onRetry={() => void options.refetch()} />
      ) : (
        <MovementForm formId={FORM_ID} options={options.data} movement={movement} serverError={serverError} onSubmit={handleSubmit} />
      )}
    </Drawer>
  );
}

export default NewMovementDrawer;
