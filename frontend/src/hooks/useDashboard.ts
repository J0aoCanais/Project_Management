import { useQuery } from "@tanstack/react-query";
import { getDashboard, type DashboardSummary } from "../api/dashboardApi";

export function useDashboard() {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });
}
