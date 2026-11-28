import { useState } from "react";
import { Link } from "react-router-dom";

import type { OpportunityDetail } from "../../api/opportunitiesApi";
import { formatIsoDate, formatMoney } from "../../lib/format";
import { entityPath } from "../../lib/links";
import Button from "../ui/Button";
import RecordFields from "../ui/RecordFields";
import OpportunityNotesDialog from "./OpportunityNotesDialog";

interface Props {
  detail: OpportunityDetail;
  /** Uma oportunidade fechada (rejeitada ou convertida) já não se edita. */
  editable: boolean;
}

function OpportunitySummary({ detail, editable }: Props) {
  const { property } = detail;
  const [editingNotes, setEditingNotes] = useState(false);
  return (
    <RecordFields
      title="Informação principal"
      fields={[
        { label: "Tipologia", value: detail.typology },
        { label: "Zona", value: detail.zone },
        { label: "Área", value: property.areaM2 ? `${property.areaM2} m²` : "—" },
        { label: "Preço pedido", value: formatMoney(detail.askingPrice) },
        { label: "VVR", value: formatMoney(detail.vvr) },
        {
          label: "Contacto",
          value:
            detail.contactId !== undefined ? (
              <Link to={entityPath({ kind: "contact", id: detail.contactId })} className="text-brand hover:underline">
                {detail.contactName ?? "Ver contacto"}
              </Link>
            ) : (
              (detail.contactName ?? "—")
            ),
        },
        {
          label: "Imóvel",
          value:
            property.id !== undefined ? (
              <Link to={entityPath({ kind: "property", id: property.id })} className="text-brand hover:underline">
                {property.code}
              </Link>
            ) : (
              property.code
            ),
        },
        { label: "Data de visita", value: property.visitDate ? formatIsoDate(property.visitDate) : "—" },
      ]}
    >
      <div className="px-3 py-3">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="text-[11px] font-normal text-muted">Observações</h3>
          {editable && (
            <Button variant="icon" icon="edit" aria-label="Editar nota" title="Editar nota" onClick={() => setEditingNotes(true)} />
          )}
        </div>
        <p className="text-xs leading-relaxed whitespace-pre-line wrap-anywhere">{detail.notes ?? "Sem observações."}</p>
      </div>
      {editingNotes && <OpportunityNotesDialog opportunityId={detail.id} initialNotes={detail.notes ?? ""} onClose={() => setEditingNotes(false)} />}
    </RecordFields>
  );
}

export default OpportunitySummary;
