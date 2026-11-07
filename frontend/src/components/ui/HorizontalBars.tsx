interface Item {
  label: string;
  value: number;
}

interface Props {
  items: Item[];
}

function HorizontalBars({ items }: Props) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <div className="grid gap-2.5 p-3.5">
      {items.map((item) => (
        <div key={item.label} className="grid grid-cols-[110px_1fr_28px] items-center gap-2 text-[11px]">
          <span className="truncate">{item.label}</span>
          <i className="block h-3 rounded-[1px] bg-surface">
            <b className="block h-full rounded-[1px] bg-brand" style={{ width: `${(item.value / max) * 100}%` }} />
          </i>
          <strong className="text-right tabular-nums">{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default HorizontalBars;
