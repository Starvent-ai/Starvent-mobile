import { describe, expect, it } from "vitest";
import { collateralActions } from "@/modules/collateral/useCollateral";
import type { CollateralRecord } from "@shared/types";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

describe("collateral", () => {
  it("flags a valid record due within the near-due window", () => {
    collateralActions.createCollateral({
      type: "چک",
      relatedTo: "پروندهٔ تست",
      description: "چک تست ۱",
      guarantorName: "",
      dueDate: daysFromNow(2),
      amount: 0
    });
    const records = collateralActions.getState().records;
    const created = records[records.length - 1];
    expect(collateralActions.isNearDue(created)).toBe(true);
  });

  it("does not flag a record far in the future", () => {
    collateralActions.createCollateral({
      type: "سفته",
      relatedTo: "پروندهٔ تست ۲",
      description: "سفتهٔ تست",
      guarantorName: "",
      dueDate: daysFromNow(60),
      amount: 0
    });
    const records = collateralActions.getState().records;
    const created = records[records.length - 1];
    expect(collateralActions.isNearDue(created)).toBe(false);
  });

  it("stops flagging a record once it is no longer معتبر", () => {
    collateralActions.createCollateral({
      type: "طلا",
      relatedTo: "پروندهٔ تست ۳",
      description: "طلای تست",
      guarantorName: "",
      dueDate: daysFromNow(1),
      amount: 500000
    });
    const records = collateralActions.getState().records;
    const created: CollateralRecord = records[records.length - 1];

    collateralActions.updateStatus(created.id, "بازگردانده شده");
    const updated = collateralActions.getState().records.find((r) => r.id === created.id)!;
    expect(collateralActions.isNearDue(updated)).toBe(false);
  });
});
