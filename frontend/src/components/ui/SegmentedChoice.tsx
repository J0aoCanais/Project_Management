import Icon, { type IconName } from "./Icon";

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

/** Escolha exclusiva em botões, como "Quadro / Lista". */
function SegmentedChoice<T extends string>({ options, value, onChange, label }: Props<T>) {
  return (
    <div role="group" aria-label={label} className="flex rounded-control bg-line p-[3px]">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`flex h-8 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-control px-2.5 text-xs ${
              active ? "bg-white font-semibold text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {option.icon && <Icon name={option.icon} size={15} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedChoice;
