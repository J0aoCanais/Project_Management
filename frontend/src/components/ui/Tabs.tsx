import type { KeyboardEvent } from "react";

interface Props<T extends string> {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

/** Separadores controlados; as setas esquerda e direita mudam de separador. */
function Tabs<T extends string>({ tabs, value, onChange, label }: Props<T>) {
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const step = e.key === "ArrowRight" ? 1 : -1;
    const current = tabs.findIndex((tab) => tab.value === value);
    const nextIndex = (current + step + tabs.length) % tabs.length;
    onChange(tabs[nextIndex].value);
    const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]");
    buttons[nextIndex]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} onKeyDown={handleKey} className="mb-3 flex gap-[22px] overflow-auto border-b border-line">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={`whitespace-nowrap border-b-2 pb-2.5 text-xs ${
              active ? "border-brand font-semibold text-brand" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
