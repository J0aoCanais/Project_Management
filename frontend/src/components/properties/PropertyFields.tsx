import type { PropertyDetail } from "../../api/propertiesApi";
import { formatIsoDate, formatMoney } from "../../lib/format";
import RecordFields from "../ui/RecordFields";

interface Props {
  property: PropertyDetail;
}

/** Separador "Dados" do imóvel. */
function PropertyFields({ property }: Props) {
  return (
    <RecordFields
      title="Ficha técnica"
      fields={[
        { label: "Código", value: property.code },
        { label: "Tipo", value: property.propertyType },
        { label: "Tipologia", value: property.typology },
        { label: "Zona", value: property.zone },
        { label: "Área", value: `${property.areaM2.toLocaleString("pt-PT")} m²` },
        { label: "Ano de construção", value: property.constructionYear ?? "—" },
        { label: "Estado de conservação", value: property.condition ?? "—" },
        { label: "Certificado energético", value: property.energyCertificate ?? "—" },
        { label: "Data de visita", value: property.visitDate ? formatIsoDate(property.visitDate) : "—" },
        { label: "Preço pedido", value: formatMoney(property.askingPrice) },
        { label: "VVR", value: formatMoney(property.vvr) },
        { label: "Lucro estimado", value: formatMoney(property.estimatedProfit) },
        {
          label: "Anúncio",
          value: property.sourceUrl ? (
            <a href={property.sourceUrl} target="_blank" rel="noreferrer" className="break-all text-brand hover:underline">
              Abrir anúncio
            </a>
          ) : (
            "—"
          ),
        },
      ]}
    >
      <div className="px-3 py-3">
        <h3 className="mb-1 text-[11px] font-normal text-muted">Notas</h3>
        <p className="text-xs leading-relaxed whitespace-pre-line wrap-anywhere">{property.notes ?? "Sem notas."}</p>
      </div>
    </RecordFields>
  );
}

export default PropertyFields;
