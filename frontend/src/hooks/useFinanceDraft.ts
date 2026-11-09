import { useEffect, useState } from "react";

import type { ExtraCost, FinanceValues, OpportunityDetail } from "../api/opportunitiesApi";

export interface FinanceDraft {
  values: FinanceValues;
  extras: ExtraCost[];
}

/** Alterações por guardar da análise financeira. Sem edições, mostra sempre o que está guardado. */
export function useFinanceDraft(detail: OpportunityDetail) {
  const [draft, setDraft] = useState<FinanceDraft | null>(null);

  const saved: FinanceDraft = { values: detail.finance, extras: detail.extraCosts };
  const current = draft ?? saved;
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(saved);

  // A navegação dentro da aplicação não se pode bloquear com BrowserRouter; isto cobre recarregar e fechar o separador.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return {
    current,
    dirty,
    setValues: (values: FinanceValues) => setDraft((previous) => ({ ...(previous ?? saved), values })),
    setExtras: (extras: ExtraCost[]) => setDraft((previous) => ({ ...(previous ?? saved), extras })),
    discard: () => setDraft(null),
    /** Depois de guardar: mantém o que tiver sido escrito entretanto. */
    markSaved: (sent: FinanceDraft) => setDraft((previous) => (previous === sent ? null : previous)),
  };
}
