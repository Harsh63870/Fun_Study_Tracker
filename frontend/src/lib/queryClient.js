import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

export const queryKeys = {
  stats: ["stats"],
  sessions: ["sessions"],
  tasks: (status) => ["tasks", status],
};

export function invalidateAll() {
  queryClient.invalidateQueries({ queryKey: queryKeys.stats });
  queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
}
