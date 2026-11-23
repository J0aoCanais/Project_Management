import { useSearchParams } from "react-router-dom";

/** Filtros de uma lista guardados no URL (`?q=&zona=…`), para sobreviverem ao recarregar e ao voltar do detalhe. */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const [params, setParams] = useSearchParams();
  const values = Object.fromEntries(keys.map((key) => [key, params.get(key) ?? ""])) as Record<K, string>;

  const set = (key: K, value: string) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const clear = () =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        keys.forEach((key) => next.delete(key));
        return next;
      },
      { replace: true },
    );

  return { values, set, clear, active: keys.some((key) => values[key]) };
}
