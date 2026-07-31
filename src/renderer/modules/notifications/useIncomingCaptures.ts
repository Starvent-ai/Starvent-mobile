import { useEffect } from "react";
import { createStore } from "@/state/createStore";
import { customerActions } from "@/modules/customers/useCustomers";
import type { IncomingPhoneCapture } from "@shared/types";

interface CapturesState {
  captures: IncomingPhoneCapture[];
}

const capturesStore = createStore<CapturesState>({ captures: [] });

function addCapture(phone: string, source: IncomingPhoneCapture["source"]): void {
  const normalized = phone.replace(/\D/g, "").slice(0, 11);
  if (!normalized) return;
  const matched = customerActions.getState().customers.find((c) => c.phone === normalized);
  const capture: IncomingPhoneCapture = {
    id: `cap-${Date.now()}`,
    phone: normalized,
    matchedCustomerId: matched?.id ?? null,
    source,
    handled: false,
    receivedAt: new Date().toISOString()
  };
  capturesStore.setState((prev) => ({ captures: [capture, ...prev.captures] }));
}

function markHandled(captureId: string): void {
  capturesStore.setState((prev) => ({
    captures: prev.captures.map((c) => (c.id === captureId ? { ...c, handled: true } : c))
  }));
}

function dismissCapture(captureId: string): void {
  capturesStore.setState((prev) => ({
    captures: prev.captures.filter((c) => c.id !== captureId)
  }));
}

/**
 * Subscribes once (in the Notifications module) to the main-process
 * network listener, if the customer-number device is configured that
 * way. If instead the device behaves like a keyboard, addCapture is
 * called directly from the manual-entry input's onKeyDown — no
 * subscription needed for that path.
 */
export function useIncomingCaptureListener(): void {
  useEffect(() => {
    if (!window.starvent) return;
    const unsubscribe = window.starvent.phoneCapture.onReceived((phone) => {
      addCapture(phone, "شبکه");
    });
    return unsubscribe;
  }, []);
}

export function useIncomingCaptures() {
  const state = capturesStore.useStore();
  return { captures: state.captures, addCapture, markHandled, dismissCapture };
}

export const incomingCaptureActions = { addCapture, markHandled, dismissCapture, getState: capturesStore.getState };
