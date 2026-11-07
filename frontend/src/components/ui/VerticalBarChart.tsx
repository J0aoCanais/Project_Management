interface Item {
  label: string;
  value: number;
}

interface Props {
  items: Item[];
}

const MAX_BAR_PX = 120;

function VerticalBarChart({ items }: Props) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <div className="flex items-end justify-around gap-1 overflow-x-auto px-2.5 py-3">
      {items.map((item) => (
        <div key={item.label} className="min-w-14 flex-1 text-center">
          <div className="flex h-[135px] flex-col items-center justify-end">
            <span className="mb-1 text-[11px] font-bold tabular-nums">{item.value}</span>
            <i className="block w-[70%] rounded-t-control bg-brand" style={{ height: `${(item.value / max) * MAX_BAR_PX}px` }} />
          </div>
          <small className="mt-1 block min-h-[26px] text-[10px] leading-tight text-muted">{item.label}</small>
        </div>
      ))}
    </div>
  );
}

export default VerticalBarChart;
