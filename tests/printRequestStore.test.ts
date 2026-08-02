import { describe, expect, it } from "vitest";
import { printRequestActions } from "@/state/printRequestStore";

describe("printRequestStore", () => {
  it("holds the requested sale id until it is cleared", () => {
    printRequestActions.requestInvoicePrint("sale-123");
    expect(printRequestActions.getState().pendingSaleId).toBe("sale-123");

    printRequestActions.clearPendingSaleId();
    expect(printRequestActions.getState().pendingSaleId).toBeNull();
  });
});
