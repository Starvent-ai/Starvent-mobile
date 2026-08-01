import { createStore } from "@/state/createStore";
import type { SaleRecord } from "@shared/types";
import { inventoryActions } from "@/modules/inventory/useInventory";
import { customerActions } from "@/modules/customers/useCustomers";
import { accountingActions } from "@/modules/accounting/useAccounting";

interface SalesState {
  sales: SaleRecord[];
}

const salesStore = createStore<SalesState>({ sales: [] });

interface RecordSaleInput {
  itemId: string;
  customerId: string | null;
  quantity: number;
}

/** Records a sale and keeps inventory + customer purchase counts in sync. */
function recordSale(input: RecordSaleInput): { ok: true } | { ok: false; error: string } {
  const item = inventoryActions.getState().items.find((i) => i.id === input.itemId);
  if (!item) {
    return { ok: false, error: "کالای انتخاب‌شده یافت نشد." };
  }
  if (input.quantity <= 0) {
    return { ok: false, error: "تعداد باید بزرگ‌تر از صفر باشد." };
  }
  if (item.quantity < input.quantity) {
    return { ok: false, error: `موجودی کافی نیست. موجودی فعلی: ${item.quantity}` };
  }

  const total = item.salePrice * input.quantity;
  const record: SaleRecord = {
    id: `sale-${Date.now()}`,
    itemId: item.id,
    itemName: item.name,
    customerId: input.customerId,
    quantity: input.quantity,
    unitPrice: item.salePrice,
    total,
    createdAt: new Date().toISOString()
  };

  salesStore.setState((prev) => ({ sales: [...prev.sales, record] }));
  inventoryActions.adjustQuantity(item.id, -input.quantity);
  if (input.customerId) {
    customerActions.incrementPurchases(input.customerId);
  }
  accountingActions.recordTransaction({
    type: "درآمد",
    account: "صندوق",
    category: "فروش",
    amount: total,
    description: `فروش ${item.name} × ${input.quantity}`
  });

  return { ok: true };
}

export function useSales() {
  const state = salesStore.useStore();
  return { sales: state.sales, recordSale };
}

export const salesActions = { recordSale, getState: salesStore.getState };
