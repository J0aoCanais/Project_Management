
import { apiFetch } from "./client";

export interface HealthResponse {
  status: "ok" | "error";
  database: "connected" | "unreachable";
}

export async function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/demos/health");
}
