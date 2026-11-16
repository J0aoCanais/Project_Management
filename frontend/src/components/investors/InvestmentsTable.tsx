import { useState } from "react";

import type { Investment } from "../../api/investorsApi";
import { formatIsoDate, formatMoney, formatPercent } from "../../lib/format";
import Button from "../ui/Button";
import Panel from "../ui/Panel";
import Table, { type TableColumn } from "../ui/Table";
import NewInvestmentDrawer from "./NewInvestmentDrawer";

interface Props {
  investorId: number;
  investorName: string;
  investments: Investment[];
}

/** 8 → "8,0%"; 99,99 → "99,99%" (com uma casa só, ficava "100,0%"). */
const percent = (value: number) => formatPercent(value, Number.isInteger(Math.round(value * 100) / 10) ? 1 : 2);

const columns: TableColumn<Investment>[] = [
  { key: "operation", header: "Operação", render: (investment) => investment.operationCode },
  { key: "committed", header: "Valor comprometido", align: "right", render: (investment) => formatMoney(investment.committedValue) },
  { key: "participation", header: "Participação", align: "right", render: (investment) => percent(investment.participationPercent) },
  { key: "returnType", header: "Tipo de retorno", render: (investment) => investment.returnType },
  { key: "rate", header: "Taxa", align: "right", render: (investment) => percent(investment.returnRate) },
  { key: "date", header: "Data do acordo", render: (investment) => formatIsoDate(investment.agreementDate) },
];

function InvestmentsTable({ investorId, investorName, investments }: Props) {
  const [creating, setCreating] = useState(false);
  const total = investments.reduce((sum, investment) => sum + investment.committedValue, 0);

  return (
    <>
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
          <h2 className="text-xs font-bold">Investimentos</h2>
          <Button icon="plus" onClick={() => setCreating(true)}>
            Novo investimento
          </Button>
        </div>
        {investments.length ? (
          <Table columns={columns} rows={investments} getRowKey={(investment) => investment.id} footer={{ operation: "Total", committed: formatMoney(total) }} />
        ) : (
          <p className="px-3 py-6 text-center text-xs text-muted">Ainda não há investimentos registados.</p>
        )}
      </Panel>
      {creating && <NewInvestmentDrawer investorId={investorId} investorName={investorName} onClose={() => setCreating(false)} />}
    </>
  );
}

export default InvestmentsTable;
