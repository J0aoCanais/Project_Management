import type { DocumentRecord } from "../../api/documentsApi";
import { useDeleteDocument } from "../../hooks/useDocuments";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import Notice from "../ui/Notice";

interface Props {
  document: DocumentRecord;
  onClose: () => void;
}

function DeleteDocumentDialog({ document, onClose }: Props) {
  const remove = useDeleteDocument();
  return (
    <Dialog
      title="Eliminar documento"
      description={
        <>
          O documento <strong className="wrap-anywhere text-ink">{document.name}</strong> deixa de estar associado a {document.owner.label}. Esta ação não pode ser desfeita.
        </>
      }
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="danger" disabled={remove.isPending} onClick={() => remove.mutate({ id: document.id, owner: document.owner }, { onSuccess: onClose })}>
            Eliminar
          </Button>
        </>
      }
    >
      {remove.isError && <Notice tone="warning">Não foi possível eliminar o documento. Tente novamente.</Notice>}
    </Dialog>
  );
}

export default DeleteDocumentDialog;
