import { useEffect, useRef, useState } from "react";

import Icon from "./Icon";

export interface FilterSelect {
  id: string;
  /** Nome acessível e primeira opção: "Todos os estados". Corresponde ao valor vazio. */
  allLabel: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

interface Props {
  search: { placeholder: string; value: string; onChange: (value: string) => void };
  selects?: FilterSelect[];
  /** Sem margem e com pesquisa mais curta, para usar dentro de uma barra de ferramentas. */
  compact?: boolean;
}

const control = "h-[34px] rounded-control border border-line bg-white";

function Filters({ search, selects = [], compact = false }: Props) {
  const [searchValue, setSearchValue] = useState(search.value);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setSearchValue(search.value);
  }, [search.value]);

  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
  }, []);

  return (
    <div className={`flex flex-col gap-2 min-[721px]:flex-row min-[721px]:flex-wrap ${compact ? "" : "mb-2"}`}>
      <label className={`flex items-center gap-2 px-2.5 text-muted focus-within:border-brand ${control} ${compact ? "min-[721px]:min-w-[220px]" : "min-[721px]:min-w-[300px]"}`}>
        <Icon name="search" size={16} />
        <input
          type="search"
          aria-label={search.placeholder}
          placeholder={search.placeholder}
          value={searchValue}
          onChange={(e) => {
            const value = e.target.value;
            setSearchValue(value);
            if (searchTimer.current) clearTimeout(searchTimer.current);
            searchTimer.current = setTimeout(() => {
              search.onChange(value);
            }, 500);
          }}
          className="w-full min-w-0 border-0 bg-transparent text-xs text-ink outline-none"
        />
      </label>
      {selects.map((select) => (
        <select
          key={select.id}
          aria-label={select.allLabel}
          value={select.value}
          onChange={(e) => select.onChange(e.target.value)}
          className={`px-2.5 text-xs text-muted ${control}`}
        >
          <option value="">{select.allLabel}</option>
          {select.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}

export default Filters;
