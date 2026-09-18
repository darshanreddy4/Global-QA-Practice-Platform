import { useEffect, useState, useCallback } from "react";
import { ApiError, apiRequest } from "./apiClient";

export type ResourceState<T> =
  | { status: "loading" }
  | { status: "error"; error: ApiError }
  | { status: "success"; data: T };

/**
 * Reusable "server cache" hook (ARCHITECTURE.md §13). Every practice component
 * that needs API data uses this instead of ad hoc useEffect/fetch calls, so
 * loading/error/empty states are consistent everywhere.
 */
export function useApiResource<T>(path: string | null, deps: unknown[] = []): ResourceState<T> & { refetch: () => void } {
  const [state, setState] = useState<ResourceState<T>>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    setState({ status: "loading" });
    apiRequest<T>(path)
      .then((data) => {
        if (!cancelled) setState({ status: "success", data });
      })
      .catch((error: ApiError) => {
        if (!cancelled) setState({ status: "error", error });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, nonce, ...deps]);

  return { ...state, refetch };
}
