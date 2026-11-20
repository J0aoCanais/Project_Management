import type { Investor } from "../../api/investorsApi";
import { formatMoney } from "../../lib/format";
import Table, { type TableColumn } from "../ui/Table";
import { investorKindLabel } from "../../lib/investorRules";
import InvestorStatusPill from "./InvestorStatusPill";

interface Props {
  investors: Investor[];
  onRowClick: (investor: Investor) => void;
}

const columns: TableColumn<Investor>[] = [
  { key: "name", header: "Investidor", truncate: true, render: (investor) => investor.name },
  { key: "capital", header: "Capital disponível", align: "right", render: (investor) => formatMoney(investor.profile.availableCapital) },
  { key: "kind", header: "Estrutura", render: (investor) => investorKindLabel(investor.profile) },
  { key: "risk", header: "Perfil de risco", render: (investor) => investor.profile.riskProfile },
  { key: "zones", header: "Zonas preferidas", truncate: true, render: (investor) => investor.profile.preferredZones.join(" · ") || "—" },
  { key: "status", header: "Estado", render: (investor) => <InvestorStatusPill status={investor.profile.relationStatus} /> },
];

function InvestorsTable({ investors, onRowClick }: Props) {
  return <Table columns={columns} rows={investors} getRowKey={(investor) => investor.id} onRowClick={onRowClick} />;
}

export default InvestorsTable;
