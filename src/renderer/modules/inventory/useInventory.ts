import { createStore } from "@/state/createStore";
import type { InventoryItem } from "@shared/types";

interface InventoryState {
  items: InventoryItem[];
}

const seedItems: InventoryItem[] = [
  {
    id: "itm-1",
    name: "گوشی موبایل سامسونگ A55",
    category: "موبایل",
    sku: "SM-A55-128",
    quantity: 6,
    purchasePrice: 18500000,
    salePrice: 21900000,
    lowStockThreshold: 3
  },
  {
    id: "itm-2",
    name: "قاب محافظ شفاف",
    category: "قاب",
    sku: "CASE-CLR-01",
    quantity: 2,
    purchasePrice: 85000,
    salePrice: 190000,
    lowStockThreshold: 5
  },
  {
    id: "itm-3",
    name: "پاوربانک 20000mAh",
    category: "پاوربانک",
    sku: "PB-20K",
    quantity: 14,
    purchasePrice: 620000,
    salePrice: 890000,
    lowStockThreshold: 4
  }
];

const inventoryStore = createStore<InventoryState>({ items: seedItems });

function addItem(item: Omit<InventoryItem, "id">): void {
  inventoryStore.setState((prev) => ({
    items: [...prev.items, { ...item, id: `itm-${Date.now()}` }]
  }));
}

function adjustQuantity(itemId: string, delta: number): void {
  inventoryStore.setState((prev) => ({
    items: prev.items.map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    )
  }));
}

function updateItem(itemId: string, updates: Partial<Omit<InventoryItem, "id">>): void {
  inventoryStore.setState((prev) => ({
    items: prev.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
  }));
}

function deleteItem(itemId: string): void {
  inventoryStore.setState((prev) => ({
    items: prev.items.filter((item) => item.id !== itemId)
  }));
}

export function useInventory() {
  const state = inventoryStore.useStore();
  return { items: state.items, addItem, adjustQuantity, updateItem, deleteItem };
}

// Exposed for direct, non-hook access (e.g. from other module hooks like Sales).
export const inventoryActions = {
  addItem,
  adjustQuantity,
  updateItem,
  deleteItem,
  getState: inventoryStore.getState
};
