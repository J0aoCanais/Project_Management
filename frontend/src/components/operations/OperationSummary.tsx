import { Link } from "react-router-dom";

import type { OperationDetail } from "../../api/operationsApi";
import { formatIsoDate, formatMoney } from "../../lib/format";
import RecordFields from "../ui/RecordFields";

interface Props {
  operation: OperationDetail;
}

function OperationSummary({ operation }: Props) {
  return (
    <RecordFields
      title="Informação principal"
      fields={[
        { label: "Código", value: operation.code },
        { label: "Imóvel", value: `${operation.typology} · ${operation.title}` },
        { label: "Contacto comprador", value: operation.buyerName || "—" },
        { label: "Preço de compra real", value: formatMoney(operation.realPurchasePrice) },
        { label: "Preço anunciado", value: formatMoney(operation.advertisedPrice) },
        { label: "Preço final de venda", value: operation.finalSalePrice ? formatMoney(operation.finalSalePrice) : "—" },
        { label: "Data da escritura", value: operation.saleDeedDate ? formatIsoDate(operation.saleDeedDate) : "—" },
        {
          label: "Oportunidade de origem",
          value: operation.opportunityId ? <Link className="text-brand hover:underline" to={`/oportunidades/${operation.opportunityId}`}>Ver oportunidade</Link> : "—",
        },
      ]}
    />
  );
}

export default OperationSummary;
