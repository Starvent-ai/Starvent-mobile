import { useSyncExternalStore } from "react";

/**
 * A tiny in-memory store shared across modules. This is intentionally the
 * only place that will need to change when Zar Star's real data layer
 * (SQLite/IPC) is wired in — every module hook already reads through this
 * abstraction, so swapping the implementation later won't touch UI code.
 */
export function createStore<T>(initialState: T) {
  let state = initialState;
  const listeners = new Set<() => void>();

  function getState(): T {
    return state;
  }

  function setState(updater: (prev: T) => T): void {
    state = updater(state);
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function useStore(): T {
    return useSyncExternalStore(subscribe, getState, getState);
  }

  return { getState, setState, useStore };
}
