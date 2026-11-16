interface Item {
  label: string;
  value: number;
  /** Segundo valor, desenhado ao lado numa cor mais clara (ex.: previsto ao lado do realizado). */
  compare?: number;
}

interface Props {
  items: Item[];
  /** Como mostrar os valores (ex.: formatCompactMoney). */
  formatValue?: (value: number) => string;
  /** Legenda quando há `compare`: nome de cada série. */
  legend?: { value: string; compare: string };
}

const MAX_BAR_PX = 110;

function VerticalBarChart({ items, formatValue = String, legend }: Props) {
  const max = Math.max(1, ...items.flatMap((item) => [item.value, item.compare ?? 0]));
  const height = (value: number) => `${(value / max) * MAX_BAR_PX}px`;
  return (
    <div className="px-2.5 py-3">
      {legend && (
        <div className="mb-2 flex justify-end gap-4 text-[11px] text-muted">
          <span>
            <b className="mr-1.5 inline-block size-[7px] rounded-full bg-sidebar-accent" />
            {legend.compare}
          </span>
          <span>
            <b className="mr-1.5 inline-block size-[7px] rounded-full bg-brand" />
            {legend.value}
          </span>
        </div>
      )}
      <div className="flex items-end justify-around gap-1 overflow-x-auto">
        {items.map((item) => (
          <div key={item.label} className={`flex-1 text-center ${item.compare === undefined ? "min-w-14" : "min-w-[112px]"}`}>
            {item.compare === undefined ? (
              <div className="flex h-[135px] flex-col items-center justify-end">
                <span className="mb-1 text-[11px] font-bold tabular-nums">{formatValue(item.value)}</span>
                <i className="block w-[70%] rounded-t-control bg-brand" style={{ height: height(item.value) }} />
              </div>
            ) : (
              <div role="img" aria-label={`${legend?.compare ?? ""} ${formatValue(item.compare)}, ${legend?.value ?? ""} ${formatValue(item.value)}`} className="flex h-[135px] items-end justify-center gap-1">
                {[
                  { amount: item.compare, tone: "bg-sidebar-accent" },
                  { amount: item.value, tone: "bg-brand" },
                ].map((bar) => (
                  <div key={bar.tone} className="flex w-[52px] flex-col items-center">
                    <span className="mb-1 whitespace-nowrap text-[10px] font-bold tabular-nums">{formatValue(bar.amount)}</span>
                    <i className={`block w-8 rounded-t-control ${bar.tone}`} style={{ height: height(bar.amount) }} />
                  </div>
                ))}
              </div>
            )}
            <small className="mt-1 block min-h-[26px] text-[10px] leading-tight text-muted">{item.label}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VerticalBarChart;
