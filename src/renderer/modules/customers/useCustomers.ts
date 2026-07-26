import { createStore } from "@/state/createStore";
import type { Customer } from "@shared/types";

interface CustomersState {
  customers: Customer[];
}

const seedCustomers: Customer[] = [
  { id: "cus-1", fullName: "محمد رضایی", phone: "0912xxxxxxx", loyaltyTier: "طلایی", totalPurchases: 4 },
  { id: "cus-2", fullName: "سارا احمدی", phone: "0935xxxxxxx", loyaltyTier: "نقره‌ای", totalPurchases: 2 },
  { id: "cus-3", fullName: "علی کریمی", phone: "0917xxxxxxx", loyaltyTier: "عادی", totalPurchases: 1 }
];

const customersStore = createStore<CustomersState>({ customers: seedCustomers });

function addCustomer(customer: Omit<Customer, "id" | "totalPurchases">): void {
  customersStore.setState((prev) => ({
    customers: [
      ...prev.customers,
      { ...customer, id: `cus-${Date.now()}`, totalPurchases: 0 }
    ]
  }));
}

function incrementPurchases(customerId: string): void {
  customersStore.setState((prev) => ({
    customers: prev.customers.map((c) =>
      c.id === customerId ? { ...c, totalPurchases: c.totalPurchases + 1 } : c
    )
  }));
}

export function useCustomers() {
  const state = customersStore.useStore();
  return { customers: state.customers, addCustomer };
}

export const customerActions = {
  addCustomer,
  incrementPurchases,
  getState: customersStore.getState
};
