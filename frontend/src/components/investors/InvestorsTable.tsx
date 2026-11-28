import { Link } from "react-router-dom";

import type { Investor } from "../../api/investorsApi";
import { formatMoney } from "../../lib/format";
import { entityPath } from "../../lib/links";
import Table, { type TableColumn } from "../ui/Table";
import InvestorStatusPill from "./InvestorStatusPill";

interface Props {
  investors: Investor[];
  onRowClick: (investor: Investor) => void;
}

/** Telemóvel ou email do contacto, com link para o contacto quando o investidor tem um em /contactos. */
function renderContact(investor: Investor) {
  const text = investor.phone || investor.email || "—";
  if (investor.contactId === undefined || text === "—") return text;
  return (
    <Link
      to={entityPath({ kind: "contact", id: investor.contactId })}
      title={investor.phone && investor.email ? investor.email : undefined}
      className="text-brand hover:underline"
      // A linha também é clicável (abre o investidor): o link não a pode ativar.
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {text}
    </Link>
  );
}

// Colunas pedidas pelo cliente, por esta ordem. Os montantes mínimo e máximo só aparecem no perfil.
const columns: TableColumn<Investor>[] = [
  { key: "name", header: "Investidor", truncate: true, render: (investor) => investor.name },
  { key: "contact", header: "Contacto", render: renderContact },
  { key: "zones", header: "Zona", truncate: true, render: (investor) => investor.profile.preferredZones.join(" · ") || "—" },
  { key: "capital", header: "Capital Disponível", align: "right", render: (investor) => formatMoney(investor.profile.availableCapital) },
  { key: "risk", header: "Risco", render: (investor) => investor.profile.riskProfile },
  { key: "status", header: "Estado", render: (investor) => <InvestorStatusPill status={investor.profile.relationStatus} /> },
  { key: "notes", header: "Notas", truncate: true, render: (investor) => investor.profile.notes || "—" },
];

function InvestorsTable({ investors, onRowClick }: Props) {
  return <Table columns={columns} rows={investors} getRowKey={(investor) => investor.id} onRowClick={onRowClick} />;
}

export default InvestorsTable;
