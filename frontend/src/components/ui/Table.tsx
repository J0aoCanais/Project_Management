import type { KeyboardEvent, ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
}

interface Props<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
}

// Em telemóvel, cada linha mostra só a primeira coluna, a segunda por baixo e a última à direita.
const mobileCell = "max-[720px]:hidden max-[720px]:first:block max-[720px]:first:truncate max-[720px]:first:font-semibold max-[720px]:last:col-start-2 max-[720px]:last:row-start-1 max-[720px]:last:block max-[720px]:last:text-right max-[720px]:[&:nth-child(2)]:col-start-1 max-[720px]:[&:nth-child(2)]:block max-[720px]:[&:nth-child(2)]:text-left max-[720px]:[&:nth-child(2)]:text-[11px] max-[720px]:[&:nth-child(2)]:text-muted";

function Table<T>({ columns, rows, getRowKey, onRowClick }: Props<T>) {
  const handleKey = (e: KeyboardEvent, row: T) => {
    if (e.key === "Enter") onRowClick?.(row);
  };
  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse whitespace-nowrap max-[720px]:block">
        <thead className="max-[720px]:hidden">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`h-[30px] border-b border-line bg-surface px-3 py-2 text-[11px] font-semibold tracking-[.5px] text-muted uppercase ${column.align === "right" ? "text-right" : "text-left"}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-[720px]:block">
          {rows.map((row, index) => (
            <tr
              key={getRowKey(row, index)}
              onClick={onRowClick && (() => onRowClick(row))}
              onKeyDown={onRowClick && ((e) => handleKey(e, row))}
              tabIndex={onRowClick ? 0 : undefined}
              className={`border-b border-line last:border-b-0 max-[720px]:grid max-[720px]:min-h-[54px] max-[720px]:grid-cols-[1fr_auto] max-[720px]:gap-0.5 max-[720px]:px-2.5 max-[720px]:py-2 ${onRowClick ? "cursor-pointer hover:bg-surface" : ""}`}
            >
              {columns.map((column) => (
                <td key={column.key} className={`h-9 px-3 text-xs max-[720px]:h-auto max-[720px]:p-0 ${column.align === "right" ? "text-right" : "text-left"} ${mobileCell}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
