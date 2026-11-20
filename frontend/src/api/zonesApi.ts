import { apiFetch } from "./client";

// Zonas: endpoints do Flask em /api/zones (ver docs/api/zones.md). A tabela é editável, como os papéis,
// e os ids populam o campo de zona dos contactos.

export interface Zone {
  id: number;
  name: string;
}

/** Todas as zonas, de A a Z (não é paginado). */
export async function listZones(): Promise<Zone[]> {
  return apiFetch<Zone[]>("/zones/");
}

/** Id de uma zona pelo nome (sem distinguir maiúsculas), ou `undefined` se não existir. */
export function findZoneId(zones: Zone[], name: string): number | undefined {
  const wanted = name.trim().toLowerCase();
  return wanted ? zones.find((zone) => zone.name.toLowerCase() === wanted)?.id : undefined;
}
