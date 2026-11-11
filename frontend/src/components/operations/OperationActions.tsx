import Button from "../ui/Button";

interface Props {
  closed: boolean;
  busy: boolean;
  cancelled: boolean;
  onAdvance: () => void;
  onCancel: () => void;
}

function OperationActions({ closed, busy, cancelled, onAdvance, onCancel }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {!closed && !cancelled && (
        <Button variant="primary" icon="arrow" disabled={busy} onClick={onAdvance}>
          Avançar fase
        </Button>
      )}
      {!cancelled && (
        <Button variant="danger" disabled={busy} onClick={onCancel}>
          Marcar como cancelada
        </Button>
      )}
    </div>
  );
}

export default OperationActions;
