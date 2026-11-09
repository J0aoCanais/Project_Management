import type { OpportunityDetail } from "../../api/opportunitiesApi";
import { formatIsoDate, formatMoney } from "../../lib/format";
import RecordFields from "../ui/RecordFields";

interface Props {
  detail: OpportunityDetail;
}

function OpportunitySummary({ detail }: Props) {
  const { property } = detail;
  return (
    <RecordFields
      title="Informação principal"
      fields={[
        { label: "Tipologia", value: detail.typology },
        { label: "Zona", value: detail.zone },
        { label: "Área", value: property.areaM2 ? `${property.areaM2} m²` : "—" },
        { label: "Preço pedido", value: formatMoney(detail.askingPrice) },
        { label: "VVR", value: formatMoney(detail.vvr) },
        { label: "Contacto", value: detail.contactName ?? "—" },
        { label: "Data de visita", value: property.visitDate ? formatIsoDate(property.visitDate) : "—" },
      ]}
    >
      <div className="px-3 py-3">
        <h3 className="mb-1 text-[11px] font-normal text-muted">Observações</h3>
        <p className="text-xs leading-relaxed">{property.notes ?? "Sem observações."}</p>
      </div>
    </RecordFields>
  );
}

export default OpportunitySummary;
