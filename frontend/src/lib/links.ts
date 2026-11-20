import type { DocumentOwnerKind } from "../api/documentsApi";

// Para onde leva o link de uma entidade associada (documentos, movimentos…).

export type EntityKind = DocumentOwnerKind | "budgetItem" | "financing" | "contact";

export interface EntityLink {
  kind: EntityKind;
  id: number;
  /** Registo onde a entidade se vê: a obra de um item de orçamento, o investidor de um investimento. */
  parentId?: number;
}

export function entityPath({ kind, id, parentId }: EntityLink): string {
  switch (kind) {
    case "opportunity":
      return `/oportunidades/${id}`;
    case "operation":
      return `/operacoes/${id}`;
    case "work":
      return `/obras/${id}`;
    case "budgetItem":
      return parentId ? `/obras/${parentId}` : "/obras";
    case "investment":
      return parentId ? `/investidores/${parentId}` : "/investidores";
    case "movement":
      return `/financas/${id}`;
    case "financing":
      return "/financas?tab=financiamentos";
    case "property":
      return `/imoveis/${id}`;
    case "contact":
      return `/contactos/${id}`;
  }
}
