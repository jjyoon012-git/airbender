// Reference: blueprint:javascript_log_in_with_replit
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
