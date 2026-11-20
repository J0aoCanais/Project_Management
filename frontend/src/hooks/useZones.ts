import { useQuery } from "@tanstack/react-query";

import { listZones } from "../api/zonesApi";

/** Zonas da tabela editável (GET /api/zones/). */
export function useZones() {
  return useQuery({ queryKey: ["zones"], queryFn: listZones, staleTime: 5 * 60_000 });
}
