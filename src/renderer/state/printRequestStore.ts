import { createStore } from "@/state/createStore";

interface PrintRequestState {
  pendingSaleId: string | null;
}

const printRequestStore = createStore<PrintRequestState>({ pendingSaleId: null });

/** Called by Sales right before navigating to Printing, when auto-print-after-sale is on. */
function requestInvoicePrint(saleId: string): void {
  printRequestStore.setState(() => ({ pendingSaleId: saleId }));
}

/** Called by Printing once it has consumed the pending request, so it doesn't re-trigger later. */
function clearPendingSaleId(): void {
  printRequestStore.setState(() => ({ pendingSaleId: null }));
}

export function usePendingSalePrint() {
  const state = printRequestStore.useStore();
  return { pendingSaleId: state.pendingSaleId, clearPendingSaleId };
}

export const printRequestActions = {
  requestInvoicePrint,
  clearPendingSaleId,
  getState: printRequestStore.getState
};
