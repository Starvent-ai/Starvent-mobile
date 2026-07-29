import { createStore } from "@/state/createStore";
import type { Supplier, SupplierPurchase } from "@shared/types";

interface SuppliersState {
  suppliers: Supplier[];
  purchases: SupplierPurchase[];
}

const seedSuppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "پخش موبایل آریا",
    phone: "021xxxxxxx",
    address: "",
    contractNotes: "تسویه ماهانه",
    balance: 0,
    rating: 4,
    createdAt: new Date().toISOString()
  }
];

const suppliersStore = createStore<SuppliersState>({ suppliers: seedSuppliers, purchases: [] });

interface NewSupplierInput {
  name: string;
  phone: string;
  address: string;
  contractNotes: string;
}

function createSupplier(input: NewSupplierInput): void {
  const supplier: Supplier = {
    ...input,
    id: `sup-${Date.now()}`,
    balance: 0,
    rating: 0,
    createdAt: new Date().toISOString()
  };
  suppliersStore.setState((prev) => ({ ...prev, suppliers: [...prev.suppliers, supplier] }));
}

interface NewPurchaseInput {
  supplierId: string;
  itemDescription: string;
  amount: number;
  paid: boolean;
}

function recordPurchase(input: NewPurchaseInput): void {
  const purchase: SupplierPurchase = {
    ...input,
    id: `pur-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10)
  };
  suppliersStore.setState((prev) => ({
    ...prev,
    purchases: [...prev.purchases, purchase],
    suppliers: prev.suppliers.map((s) =>
      s.id === input.supplierId && !input.paid ? { ...s, balance: s.balance + input.amount } : s
    )
  }));
}

function settleBalance(supplierId: string, amount: number): void {
  suppliersStore.setState((prev) => ({
    ...prev,
    suppliers: prev.suppliers.map((s) =>
      s.id === supplierId ? { ...s, balance: s.balance - amount } : s
    )
  }));
}

function setRating(supplierId: string, rating: number): void {
  suppliersStore.setState((prev) => ({
    ...prev,
    suppliers: prev.suppliers.map((s) => (s.id === supplierId ? { ...s, rating } : s))
  }));
}

export function useSuppliers() {
  const state = suppliersStore.useStore();
  return {
    suppliers: state.suppliers,
    purchases: state.purchases,
    createSupplier,
    recordPurchase,
    settleBalance,
    setRating
  };
}

export const supplierActions = {
  createSupplier,
  recordPurchase,
  settleBalance,
  setRating,
  getState: suppliersStore.getState
};
