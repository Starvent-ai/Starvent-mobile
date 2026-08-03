import { createStore } from "@/state/createStore";
import type { CollateralRecord, CollateralStatus, CollateralType } from "@shared/types";
import { generateId } from "@/lib/id";

interface CollateralState {
  records: CollateralRecord[];
}

const collateralStore = createStore<CollateralState>({ records: [] });

interface NewCollateralInput {
  type: CollateralType;
  relatedTo: string;
  description: string;
  guarantorName: string;
  dueDate: string;
}

function createCollateral(input: NewCollateralInput): void {
  const record: CollateralRecord = {
    ...input,
    id: generateId("col"),
    status: "معتبر",
    createdAt: new Date().toISOString()
  };
  collateralStore.setState((prev) => ({ records: [...prev.records, record] }));
}

function updateStatus(recordId: string, status: CollateralStatus): void {
  collateralStore.setState((prev) => ({
    records: prev.records.map((r) => (r.id === recordId ? { ...r, status } : r))
  }));
}

const NEAR_DUE_WINDOW_DAYS = 7;

/** True when a valid (not yet returned/seized) collateral's due date is
 *  today or within the next NEAR_DUE_WINDOW_DAYS days. */
function isNearDue(record: CollateralRecord): boolean {
  if (record.status !== "معتبر" || !record.dueDate) return false;
  const due = new Date(record.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);
  return diffDays <= NEAR_DUE_WINDOW_DAYS;
}

export function useCollateral() {
  const state = collateralStore.useStore();
  return {
    records: state.records,
    createCollateral,
    updateStatus,
    isNearDue
  };
}

export const collateralActions = {
  createCollateral,
  updateStatus,
  isNearDue,
  getState: collateralStore.getState
};
