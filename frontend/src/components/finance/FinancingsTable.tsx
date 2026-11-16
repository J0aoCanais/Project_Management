import type { Financing } from "../../api/financeApi";
import { formatMoney } from "../../lib/format";
import Table, { type TableColumn } from "../ui/Table";

interface Props {
  financings: Financing[];
}

const columns: TableColumn<Financing>[] = [
  { key: "name", header: "Nome", render: (financing) => financing.name },
  { key: "amount", header: "Montante", align: "right", render: (financing) => formatMoney(financing.amount) },
  { key: "used", header: "Utilizado", align: "right", render: (financing) => formatMoney(financing.used) },
  {
    key: "available",
    header: "Disponível",
    align: "right",
    render: (financing) => <span className={`font-semibold ${financing.available < 0 ? "text-danger" : ""}`}>{formatMoney(financing.available)}</span>,
  },
];

function FinancingsTable({ financings }: Props) {
  return <Table columns={columns} rows={financings} getRowKey={(financing) => financing.id} />;
}

export default FinancingsTable;
