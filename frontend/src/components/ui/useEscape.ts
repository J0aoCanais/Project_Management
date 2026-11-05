import { useEffect } from "react";

/** Chama `onDismiss` quando se carrega em Esc. Partilhado por Drawer, Dialog e menus. */
export function useEscape(onDismiss: () => void, active = true): void {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss, active]);
}
