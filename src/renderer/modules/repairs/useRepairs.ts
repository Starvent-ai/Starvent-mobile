import { createStore } from "@/state/createStore";
import type { RepairPriority, RepairStatus, RepairTicket } from "@shared/types";
import { customerActions } from "@/modules/customers/useCustomers";

interface RepairsState {
  tickets: RepairTicket[];
}

const seedTickets: RepairTicket[] = [
  {
    id: "rep-1",
    deviceModel: "آیفون 13",
    imei: "35xxxxxxxxxxxxx",
    serialNumber: "SN-A13-001",
    devicePassword: "الگو: ⌐‌⌐",
    faultDescription: "شکستگی صفحه نمایش",
    accessoriesReceived: "کابل شارژ",
    partsUsed: "",
    laborFee: 0,
    status: "در حال تعمیر",
    priority: "فوری",
    technician: "امیر",
    customerId: null,
    customerName: "محمد رضایی",
    deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    customerSignature: null,
    createdAt: new Date().toISOString()
  }
];

const repairsStore = createStore<RepairsState>({ tickets: seedTickets });

interface NewTicketInput {
  deviceModel: string;
  imei: string;
  serialNumber: string;
  devicePassword: string;
  faultDescription: string;
  accessoriesReceived: string;
  priority: RepairPriority;
  technician: string;
  customerId: string | null;
  customerName: string;
  deliveryDate: string;
}

function createTicket(input: NewTicketInput): void {
  const ticket: RepairTicket = {
    ...input,
    id: `rep-${Date.now()}`,
    partsUsed: "",
    laborFee: 0,
    status: "دریافت شده",
    customerSignature: null,
    createdAt: new Date().toISOString()
  };
  repairsStore.setState((prev) => ({ tickets: [...prev.tickets, ticket] }));
  if (input.customerId) {
    customerActions.incrementPurchases(input.customerId);
  }
}

function updateStatus(ticketId: string, status: RepairStatus): void {
  repairsStore.setState((prev) => ({
    tickets: prev.tickets.map((t) => (t.id === ticketId ? { ...t, status } : t))
  }));
}

function updatePartsAndLabor(ticketId: string, partsUsed: string, laborFee: number): void {
  repairsStore.setState((prev) => ({
    tickets: prev.tickets.map((t) => (t.id === ticketId ? { ...t, partsUsed, laborFee } : t))
  }));
}

function setSignature(ticketId: string, signatureDataUrl: string | null): void {
  repairsStore.setState((prev) => ({
    tickets: prev.tickets.map((t) =>
      t.id === ticketId ? { ...t, customerSignature: signatureDataUrl } : t
    )
  }));
}

export function useRepairs() {
  const state = repairsStore.useStore();
  return {
    tickets: state.tickets,
    createTicket,
    updateStatus,
    updatePartsAndLabor,
    setSignature
  };
}

export const repairActions = {
  createTicket,
  updateStatus,
  updatePartsAndLabor,
  setSignature,
  getState: repairsStore.getState
};
