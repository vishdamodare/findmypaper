"use client";
import { useEffect, useState } from "react";

/** Fetches /api/options for a dependent dropdown. Re-runs whenever `params` changes. */
export function useOptions<T>(type: string, params: Record<string, string>, enabled = true) {
  const [state, setState] = useState<{ key: string; data: T[] }>({ key: "", data: [] });
  const qs = new URLSearchParams({ type, ...params }).toString();
  const key = enabled ? qs : "";
  useEffect(() => {
    if (!enabled) return;
    const ac = new AbortController();
    fetch(`/api/options?${qs}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setState({ key: qs, data }))
      .catch(() => {});
    return () => ac.abort();
  }, [qs, enabled]);
  // loading until the response for the *current* params has arrived
  return { data: enabled && state.key === key ? state.data : [], loading: enabled && state.key !== key };
}
