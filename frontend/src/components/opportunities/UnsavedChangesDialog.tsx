import Button from "../ui/Button";
import Dialog from "../ui/Dialog";

interface Props {
  onStay: () => void;
  onLeave: () => void;
}

function UnsavedChangesDialog({ onStay, onLeave }: Props) {
  return (
    <Dialog
      title="Alterações por guardar"
      description="A análise financeira tem alterações que ainda não foram guardadas. Se sair, perde-as."
      onClose={onStay}
      footer={
        <>
          <Button onClick={onStay}>Continuar a editar</Button>
          <Button variant="danger" onClick={onLeave}>
            Sair sem guardar
          </Button>
        </>
      }
    />
  );
}

export default UnsavedChangesDialog;
