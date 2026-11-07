import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../api/userApi";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  });
}
