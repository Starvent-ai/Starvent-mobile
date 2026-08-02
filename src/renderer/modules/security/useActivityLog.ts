import { createStore } from "@/state/createStore";
import type { ActivityLogEntry } from "@shared/types";

interface ActivityLogState {
  entries: ActivityLogEntry[];
}

const MAX_ENTRIES = 500;

const activityLogStore = createStore<ActivityLogState>({ entries: [] });

function logActivity(
  userLabel: string,
  action: string,
  details: string,
  level: ActivityLogEntry["level"] = "info"
): void {
  const entry: ActivityLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    userLabel,
    action,
    details,
    level
  };
  activityLogStore.setState((prev) => ({ entries: [...prev.entries, entry].slice(-MAX_ENTRIES) }));
}

export function useActivityLog() {
  const state = activityLogStore.useStore();
  return { entries: state.entries, logActivity };
}

export const activityLogActions = {
  logActivity,
  getState: activityLogStore.getState
};
