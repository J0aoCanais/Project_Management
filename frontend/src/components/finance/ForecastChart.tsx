import { useState } from "react";

import type { Movement, MovementDirection } from "../../api/financeApi";
import { formatCompactMoney, formatMoney, formatMonth } from "../../lib/format";
import { totalsByCategory, totalsByMonth } from "../../lib/forecast";
import EmptyState from "../ui/EmptyState";
import Panel from "../ui/Panel";
import PanelHeader from "../ui/PanelHeader";
import SegmentedChoice from "../ui/SegmentedChoice";
import StackedTrack from "../ui/StackedTrack";
import Table, { type TableColumn } from "../ui/Table";
import VerticalBarChart from "../ui/VerticalBarChart";

interface Props {
  movements: Movement[];
}

const directions: { value: MovementDirection; label: string }[] = [
  { value: "Saída", label: "Saídas" },
  { value: "Entrada", label: "Entradas" },
];

const tones = ["dark", "main", "light"] as const;

type Row = ReturnType<typeof totalsByCategory>[number];

const columns: TableColumn<Row>[] = [
  { key: "category", header: "Categoria", render: (row) => row.category },
  { key: "expected", header: "Previsto", align: "right", render: (row) => formatMoney(row.expected) },
  { key: "missing", header: "Por realizar", align: "right", render: (row) => formatMoney(row.expected - row.done) },
  { key: "done", header: "Realizado", align: "right", render: (row) => formatMoney(row.done) },
];

/** Separador "Previsto vs. realizado": barras por mês e repartição por categoria. */
function ForecastChart({ movements }: Props) {
  const [direction, setDirection] = useState<MovementDirection>("Saída");
  const months = totalsByMonth(movements, direction);
  const categories = totalsByCategory(movements, direction);
  // A barra só tem três tons: as maiores categorias e o resto junto.
  const segments = [
    ...categories.slice(0, 2).map((row, index) => ({ label: row.category, value: row.expected, tone: tones[index] })),
    ...(categories.length > 2 ? [{ label: "Outras", value: categories.slice(2).reduce((sum, row) => sum + row.expected, 0), tone: tones[2] }] : []),
  ];

  return (
    <div className="grid gap-3.5">
      <div className="w-full min-[721px]:w-64">
        <SegmentedChoice label="Direção" options={directions} value={direction} onChange={setDirection} />
      </div>
      {months.length ? (
        <>
          <Panel>
            <PanelHeader title="Por mês" />
            <VerticalBarChart
              items={months.map((month) => ({ label: formatMonth(month.month), value: month.done, compare: month.expected }))}
              formatValue={formatCompactMoney}
              legend={{ value: "Realizado", compare: "Previsto" }}
            />
          </Panel>
          <Panel className="overflow-hidden">
            <PanelHeader title="Por categoria" />
            <div className="flex px-3.5 py-3">
              <StackedTrack segments={segments} formatValue={formatMoney} />
            </div>
            <Table columns={columns} rows={categories} getRowKey={(row) => row.category} />
          </Panel>
        </>
      ) : (
        <Panel>
          <EmptyState message={`Não há ${direction === "Saída" ? "saídas" : "entradas"} para os filtros escolhidos.`} />
        </Panel>
      )}
    </div>
  );
}

export default ForecastChart;
