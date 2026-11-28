import Button from "../ui/Button";
import Dialog from "../ui/Dialog";

interface Props {
  /** O que se perde ao sair. Por omissão, as alterações da análise financeira. */
  description?: string;
  onStay: () => void;
  onLeave: () => void;
}

function UnsavedChangesDialog({ description = "A análise financeira tem alterações que ainda não foram guardadas. Se sair, perde-as.", onStay, onLeave }: Props) {
  return (
    <Dialog
      title="Alterações por guardar"
      description={description}
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
