import { useState } from "react";

import type { OpportunityDetail } from "../../api/opportunitiesApi";
import { useUpdatePhaseNote } from "../../hooks/useOpportunities";
import { formatIsoDate } from "../../lib/format";
import PhaseHistoryTable from "./PhaseHistoryTable";
import PhaseNoteDialog from "./PhaseNoteDialog";

interface Props {
  detail: OpportunityDetail;
  /** Uma oportunidade fechada (rejeitada ou convertida) já não aceita notas novas. */
  editable: boolean;
}

/** Separador "Histórico de fases": a tabela e o botão "Adicionar nota" de cada linha. */
function OpportunityPhaseHistory({ detail, editable }: Props) {
  const phaseNote = useUpdatePhaseNote(detail.id);
  const [noteIndex, setNoteIndex] = useState<number | null>(null);
  const entry = noteIndex === null ? undefined : detail.phaseHistory[noteIndex];

  const close = () => {
    phaseNote.reset();
    setNoteIndex(null);
  };

  return (
    <>
      <PhaseHistoryTable history={detail.phaseHistory} onEditNote={editable ? setNoteIndex : undefined} />
      {entry && noteIndex !== null && (
        <PhaseNoteDialog
          title={entry.note ? "Editar nota" : "Adicionar nota"}
          description={`${entry.from} → ${entry.to} · ${formatIsoDate(entry.date)}`}
          confirmLabel="Guardar nota"
          initialNote={entry.note}
          busy={phaseNote.isPending}
          failed={phaseNote.isError}
          onClose={close}
          onConfirm={(note) => phaseNote.mutate({ index: noteIndex, note }, { onSuccess: close })}
        />
      )}
    </>
  );
}

export default OpportunityPhaseHistory;
