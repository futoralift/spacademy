import type { QueryClient, QueryKey } from "@tanstack/react-query";

export async function invalidateMany(
  queryClient: QueryClient,
  keys: ReadonlyArray<QueryKey>,
): Promise<void> {
  await Promise.all(
    keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}
