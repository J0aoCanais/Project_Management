import { useState } from "react";

import type { BudgetItem, WorkDetail } from "../../api/worksApi";
import { formatMoney } from "../../lib/format";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Icon from "../ui/Icon";
import Panel from "../ui/Panel";
import Table, { type TableColumn } from "../ui/Table";
import NewBudgetItemDrawer from "./NewBudgetItemDrawer";
import { useDeleteBudgetItem } from "../../hooks/useWorks";

interface Props {
  work: WorkDetail;
}

function BudgetTable({ work }: Props) {
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const deleteMutation = useDeleteBudgetItem(work.id);

  const handleDelete = (e: React.MouseEvent, item: BudgetItem) => {
    e.stopPropagation();
    if (window.confirm(`Tem a certeza que deseja remover a categoria "${item.categoryName}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const columns: TableColumn<BudgetItem>[] = [
    {
      key: "category",
      header: "Categoria",
      render: (item) => <strong className="font-semibold text-ink">{item.categoryName}</strong>,
    },
    {
      key: "contractor",
      header: "Empreiteiro",
      render: (item) => <span className="text-muted">{item.contractorName}</span>,
    },
    {
      key: "budgeted",
      header: "Previsto",
      align: "right",
      render: (item) => <span className="tabular-nums">{formatMoney(item.budgetedValue)}</span>,
    },
    {
      key: "contracted",
      header: "Contratado",
      align: "right",
      render: (item) => <span className="tabular-nums font-semibold">{formatMoney(item.contractedValue)}</span>,
    },
    {
      key: "executed",
      header: "Executado",
      align: "right",
      render: (item) => <span className="tabular-nums">{formatMoney(item.executedValue)}</span>,
    },
    {
      key: "invoiced",
      header: "Faturado",
      align: "right",
      render: (item) => <span className="tabular-nums">{formatMoney(item.invoicedValue)}</span>,
    },
    {
      key: "paid",
      header: "Pago",
      align: "right",
      render: (item) => <span className="tabular-nums text-success">{formatMoney(item.paidValue)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label="Editar linha"
            className="rounded p-1 text-muted hover:bg-surface hover:text-ink"
            onClick={() => setEditingItem(item)}
          >
            <Icon name="edit" size={14} />
          </button>
          <button
            type="button"
            aria-label="Remover linha"
            className="rounded p-1 text-muted hover:bg-danger-soft hover:text-danger"
            onClick={(e) => handleDelete(e, item)}
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      ),
    },
  ];

  const totalBudgeted = work.budgetItems.reduce((acc, item) => acc + (item.budgetedValue || 0), 0);
  const totalContracted = work.budgetItems.reduce((acc, item) => acc + (item.contractedValue || 0), 0);
  const totalExecuted = work.budgetItems.reduce((acc, item) => acc + (item.executedValue || 0), 0);
  const totalInvoiced = work.budgetItems.reduce((acc, item) => acc + (item.invoicedValue || 0), 0);
  const totalPaid = work.budgetItems.reduce((acc, item) => acc + (item.paidValue || 0), 0);

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-line px-3.5 py-3 min-[721px]:flex-row min-[721px]:items-center">
        <div>
          <h2 className="text-xs font-bold text-ink">Orçamento por categoria</h2>
          <p className="text-[11px] text-muted">Controlo de custos por empreiteiro e rúbrica da obra</p>
        </div>
        <div className="min-[721px]:ml-auto">
          <Button variant="primary" icon="plus" onClick={() => setIsAdding(true)}>
            Nova categoria
          </Button>
        </div>
      </div>

      {work.budgetItems.length > 0 ? (
        <>
          <Table
            columns={columns}
            rows={work.budgetItems}
            getRowKey={(item) => item.id}
            onRowClick={(item) => setEditingItem(item)}
          />
          {/* Linha de Totais */}
          <div className="border-t-2 border-line bg-surface px-3 py-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2 font-bold min-[721px]:grid-cols-7 min-[721px]:items-center">
              <span className="col-span-1 text-ink min-[721px]:col-span-2">Totais da obra</span>
              <span className="text-right tabular-nums text-muted">{formatMoney(totalBudgeted)}</span>
              <span className="text-right tabular-nums text-ink">{formatMoney(totalContracted)}</span>
              <span className="text-right tabular-nums text-muted">{formatMoney(totalExecuted)}</span>
              <span className="text-right tabular-nums text-muted">{formatMoney(totalInvoiced)}</span>
              <span className="text-right tabular-nums text-success">{formatMoney(totalPaid)}</span>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          message="Ainda não existem categorias de orçamento nesta obra."
          action={
            <Button variant="primary" icon="plus" onClick={() => setIsAdding(true)}>
              Adicionar categoria
            </Button>
          }
        />
      )}

      {(isAdding || editingItem) && (
        <NewBudgetItemDrawer
          workId={work.id}
          itemToEdit={editingItem}
          onClose={() => {
            setIsAdding(false);
            setEditingItem(null);
          }}
        />
      )}
    </Panel>
  );
}

export default BudgetTable;
