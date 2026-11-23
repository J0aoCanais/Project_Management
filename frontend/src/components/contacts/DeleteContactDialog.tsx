import { useDeleteContact } from "../../hooks/useContacts";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import Notice from "../ui/Notice";

interface Props {
  contactId: number;
  name: string;
  onClose: () => void;
  onDeleted: () => void;
}

function DeleteContactDialog({ contactId, name, onClose, onDeleted }: Props) {
  const remove = useDeleteContact(contactId);

  return (
    <Dialog
      title="Eliminar contacto"
      description={`${name} deixa de aparecer na lista e na pesquisa. O registo fica guardado para o histórico das operações.`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="danger" disabled={remove.isPending} onClick={() => remove.mutate(undefined, { onSuccess: onDeleted })}>
            Eliminar
          </Button>
        </>
      }
    >
      {remove.isError && <Notice tone="warning">Não foi possível eliminar o contacto. Tente novamente.</Notice>}
    </Dialog>
  );
}

export default DeleteContactDialog;
