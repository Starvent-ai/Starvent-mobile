import { describe, expect, it } from "vitest";
import { salesActions } from "@/modules/sales/useSales";
import { inventoryActions } from "@/modules/inventory/useInventory";
import { supplierActions } from "@/modules/suppliers/useSuppliers";
import { repairActions } from "@/modules/repairs/useRepairs";
import { accountingActions } from "@/modules/accounting/useAccounting";

describe("module chaining (single entry, auto-propagated)", () => {
  it("a sale automatically creates a matching accounting income entry", () => {
    const [item] = inventoryActions.getState().items;
    const before = accountingActions.getState().transactions.length;

    const result = salesActions.recordSale({ itemId: item.id, customerId: null, quantity: 1 });
    expect(result.ok).toBe(true);

    const transactions = accountingActions.getState().transactions;
    expect(transactions.length).toBe(before + 1);
    const last = transactions[transactions.length - 1];
    expect(last.type).toBe("درآمد");
    expect(last.category).toBe("فروش");
    expect(last.amount).toBe(item.salePrice);
  });

  it("a cash supplier purchase immediately creates an accounting expense", () => {
    const [supplier] = supplierActions.getState().suppliers;
    const before = accountingActions.getState().transactions.length;

    supplierActions.recordPurchase({ supplierId: supplier.id, itemDescription: "تست", amount: 50000, paid: true });

    const transactions = accountingActions.getState().transactions;
    expect(transactions.length).toBe(before + 1);
    expect(transactions[transactions.length - 1].type).toBe("هزینه");
  });

  it("a credit (نسیه) supplier purchase does NOT create an expense until settled", () => {
    const [supplier] = supplierActions.getState().suppliers;
    const before = accountingActions.getState().transactions.length;

    supplierActions.recordPurchase({ supplierId: supplier.id, itemDescription: "نسیه تست", amount: 70000, paid: false });
    expect(accountingActions.getState().transactions.length).toBe(before);

    supplierActions.settleBalance(supplier.id, 70000);
    expect(accountingActions.getState().transactions.length).toBe(before + 1);
  });

  it("delivering a repair with a labor fee records income exactly once, even if delivered status is set twice", () => {
    repairActions.createTicket({
      deviceModel: "تست دستگاه",
      imei: "",
      serialNumber: "",
      devicePassword: "",
      faultDescription: "تست",
      accessoriesReceived: "",
      priority: "عادی",
      technician: "",
      customerId: null,
      customerName: "مشتری تست",
      deliveryDate: "2026-08-10"
    });
    const tickets = repairActions.getState().tickets;
    const ticket = tickets[tickets.length - 1];

    repairActions.updatePartsAndLabor(ticket.id, "باتری", 120000);

    const before = accountingActions.getState().transactions.length;
    repairActions.updateStatus(ticket.id, "تحویل داده شده");
    expect(accountingActions.getState().transactions.length).toBe(before + 1);

    // Setting the same status again must not double-count.
    repairActions.updateStatus(ticket.id, "تحویل داده شده");
    expect(accountingActions.getState().transactions.length).toBe(before + 1);
  });
});
