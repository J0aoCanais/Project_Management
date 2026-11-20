import { useState, type FormEvent } from "react";

import { TEXT_LIMITS, phaseNoteError } from "../../lib/opportunityRules";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  title: string;
  /** Ex.: "Contactado → Análise financeira". */
  description: string;
  confirmLabel: string;
  initialNote?: string;
  busy?: boolean;
  failed?: boolean;
  onConfirm: (note: string) => void;
  onClose: () => void;
}

const FORM_ID = "nota-de-fase";

/** Nota opcional de uma mudança de fase: ao mudar de fase e ao acrescentar/editar a nota no histórico. */
function PhaseNoteDialog({ title, description, confirmLabel, initialNote = "", busy = false, failed = false, onConfirm, onClose }: Props) {
  const [note, setNote] = useState(initialNote);
  const error = phaseNoteError(note);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!error) onConfirm(note.trim());
  };

  return (
    <Dialog
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="grid gap-3">
        {failed && <Notice tone="warning">Não foi possível guardar. Tente novamente.</Notice>}
        <FormField label="Nota (opcional)" error={error}>
          <textarea
            autoFocus
            rows={4}
            className={`${inputClasses} resize-none wrap-anywhere`}
            placeholder="Ex.: Proprietária aceitou baixar o preço"
            value={note}
            maxLength={TEXT_LIMITS.phaseNote}
            onChange={(e) => setNote(e.target.value)}
          />
        </FormField>
      </form>
    </Dialog>
  );
}

export default PhaseNoteDialog;
