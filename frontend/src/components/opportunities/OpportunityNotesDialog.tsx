import { useState, type FormEvent } from "react";

import { useUpdateOpportunityNotes } from "../../hooks/useOpportunities";
import { TEXT_LIMITS, opportunityNotesError } from "../../lib/opportunityRules";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import { inputClasses } from "../ui/inputClasses";
import UnsavedChangesDialog from "./UnsavedChangesDialog";

interface Props {
  opportunityId: number;
  initialNotes: string;
  onClose: () => void;
}

const FORM_ID = "observacoes-oportunidade";

/** "Editar nota" do Resumo: edita as observações da oportunidade e avisa antes de perder alterações. */
function OpportunityNotesDialog({ opportunityId, initialNotes, onClose }: Props) {
  const save = useUpdateOpportunityNotes(opportunityId);
  const [notes, setNotes] = useState(initialNotes);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const error = opportunityNotesError(notes);
  const dirty = notes.trim() !== initialNotes.trim();

  const requestClose = () => {
    if (dirty) setConfirmLeave(true);
    else onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (error) return;
    if (!dirty) onClose();
    else save.mutate(notes.trim(), { onSuccess: onClose });
  };

  return (
    <>
      <Dialog
        title="Editar nota"
        description="Observações da oportunidade. A alteração fica registada na atividade."
        onClose={requestClose}
        footer={
          <>
            <Button onClick={requestClose}>Cancelar</Button>
            <Button variant="primary" type="submit" form={FORM_ID} disabled={save.isPending}>
              Guardar
            </Button>
          </>
        }
      >
        <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="grid gap-3">
          {save.isError && <Notice tone="warning">Não foi possível guardar a nota. Tente novamente.</Notice>}
          <FormField label="Observações" error={error}>
            <textarea
              autoFocus
              rows={6}
              className={`${inputClasses} resize-none wrap-anywhere`}
              value={notes}
              maxLength={TEXT_LIMITS.notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormField>
          <p className="text-right text-[11px] text-muted tabular-nums">
            {notes.length}/{TEXT_LIMITS.notes}
          </p>
        </form>
      </Dialog>
      {confirmLeave && (
        <UnsavedChangesDialog
          description="A nota tem alterações que ainda não foram guardadas. Se sair, perde-as."
          onStay={() => setConfirmLeave(false)}
          onLeave={onClose}
        />
      )}
    </>
  );
}

export default OpportunityNotesDialog;
