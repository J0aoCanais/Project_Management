interface Props {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

/** Escolha múltipla em caixas, como as zonas preferidas. Mantém a ordem das opções. */
function CheckboxGroup({ label, options, value, onChange, error }: Props) {
  const toggle = (option: string) =>
    onChange(value.includes(option) ? value.filter((item) => item !== option) : options.filter((item) => item === option || value.includes(item)));
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-1 block p-0 text-[11px] text-muted">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const checked = value.includes(option);
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-1.5 rounded-control border px-2.5 py-1.5 text-xs ${checked ? "border-brand bg-brand-soft font-semibold text-brand-dark" : "border-line bg-white text-ink"}`}
            >
              <input type="checkbox" className="accent-brand" checked={checked} onChange={() => toggle(option)} />
              {option}
            </label>
          );
        })}
      </div>
      {error && <span className="mt-1 block text-[11px] text-danger">{error}</span>}
    </fieldset>
  );
}

export default CheckboxGroup;
