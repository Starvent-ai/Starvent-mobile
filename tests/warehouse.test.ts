import { describe, expect, it } from "vitest";
import { CENTRAL_WAREHOUSE_ID, warehouseActions } from "@/modules/warehouse/useWarehouse";
import { inventoryActions } from "@/modules/inventory/useInventory";

describe("warehouse", () => {
  it("rejects a transfer larger than available stock", () => {
    const [firstItem] = inventoryActions.getState().items;
    const result = warehouseActions.transferStock({
      itemId: firstItem.id,
      fromWarehouseId: CENTRAL_WAREHOUSE_ID,
      toWarehouseId: "wh-2",
      quantity: firstItem.quantity + 1000
    });
    expect(result.ok).toBe(false);
  });

  it("moves stock from the central warehouse into a secondary warehouse", () => {
    const [firstItem] = inventoryActions.getState().items;
    const startingCentral = firstItem.quantity;
    const startingSecondary = warehouseActions.getStockQuantity("wh-2", firstItem.id);

    const result = warehouseActions.transferStock({
      itemId: firstItem.id,
      fromWarehouseId: CENTRAL_WAREHOUSE_ID,
      toWarehouseId: "wh-2",
      quantity: 1
    });

    expect(result.ok).toBe(true);
    expect(warehouseActions.getStockQuantity(CENTRAL_WAREHOUSE_ID, firstItem.id)).toBe(startingCentral - 1);
    expect(warehouseActions.getStockQuantity("wh-2", firstItem.id)).toBe(startingSecondary + 1);
  });

  it("applies a stocktake difference to the counted warehouse", () => {
    const [firstItem] = inventoryActions.getState().items;
    const systemQuantity = warehouseActions.getStockQuantity(CENTRAL_WAREHOUSE_ID, firstItem.id);

    warehouseActions.recordStocktake({
      warehouseId: CENTRAL_WAREHOUSE_ID,
      itemId: firstItem.id,
      countedQuantity: systemQuantity + 2,
      note: "شمارش تست"
    });

    expect(warehouseActions.getStockQuantity(CENTRAL_WAREHOUSE_ID, firstItem.id)).toBe(systemQuantity + 2);
  });

  it("records a defective-stock entry and reduces stock accordingly", () => {
    const [firstItem] = inventoryActions.getState().items;
    const before = warehouseActions.getStockQuantity(CENTRAL_WAREHOUSE_ID, firstItem.id);

    warehouseActions.recordDefective({
      itemId: firstItem.id,
      warehouseId: CENTRAL_WAREHOUSE_ID,
      quantity: 1,
      reason: "شکستگی تست"
    });

    expect(warehouseActions.getStockQuantity(CENTRAL_WAREHOUSE_ID, firstItem.id)).toBe(before - 1);
  });

  it("returns increase central warehouse stock", () => {
    const [firstItem] = inventoryActions.getState().items;
    const before = warehouseActions.getStockQuantity(CENTRAL_WAREHOUSE_ID, firstItem.id);

    warehouseActions.recordReturn({
      itemId: firstItem.id,
      quantity: 1,
      reason: "مرجوعی تست",
      refunded: true
    });

    expect(warehouseActions.getStockQuantity(CENTRAL_WAREHOUSE_ID, firstItem.id)).toBe(before + 1);
  });
});
