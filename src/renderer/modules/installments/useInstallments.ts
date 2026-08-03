import { createStore } from "@/state/createStore";
import type {
  InstallmentCompany,
  InstallmentContract,
  InstallmentContractStatus,
  InstallmentPayment
} from "@shared/types";
import { generateId } from "@/lib/id";

interface InstallmentState {
  companies: InstallmentCompany[];
  contracts: InstallmentContract[];
  payments: InstallmentPayment[];
}

const seedCompanies: InstallmentCompany[] = [
  { id: "ic-1", name: "بدون واسطه (مستقیم فروشگاه)", terms: "بدون کارمزد، پیگیری توسط خود فروشگاه" }
];

const installmentStore = createStore<InstallmentState>({
  companies: seedCompanies,
  contracts: [],
  payments: []
});

function createCompany(name: string, terms: string): void {
  const company: InstallmentCompany = { id: generateId("ic"), name, terms };
  installmentStore.setState((prev) => ({ ...prev, companies: [...prev.companies, company] }));
}

interface NewContractInput {
  companyId: string | null;
  customerName: string;
  itemDescription: string;
  totalAmount: number;
  downPayment: number;
  installmentCount: number;
  startDate: string;
  guaranteeNote: string;
}

function createContract(input: NewContractInput): void {
  const remaining = Math.max(0, input.totalAmount - input.downPayment);
  const installmentCount = Math.max(1, input.installmentCount);
  const contract: InstallmentContract = {
    ...input,
    id: generateId("con"),
    installmentCount,
    monthlyAmount: remaining / installmentCount,
    status: "در جریان",
    createdAt: new Date().toISOString()
  };
  installmentStore.setState((prev) => ({ ...prev, contracts: [...prev.contracts, contract] }));
}

function recordPayment(contractId: string, amount: number): void {
  const state = installmentStore.getState();
  const contract = state.contracts.find((c) => c.id === contractId);
  if (!contract) return;

  const paidCount = state.payments.filter((p) => p.contractId === contractId).length;
  const payment: InstallmentPayment = {
    id: generateId("pay"),
    contractId,
    installmentNumber: paidCount + 1,
    amount,
    date: new Date().toISOString().slice(0, 10)
  };

  installmentStore.setState((prev) => {
    const nextPayments = [...prev.payments, payment];
    const paidTotal = nextPayments.filter((p) => p.contractId === contractId).length;
    const isSettled = paidTotal >= contract.installmentCount;
    return {
      ...prev,
      payments: nextPayments,
      contracts: prev.contracts.map((c) =>
        c.id === contractId && isSettled ? { ...c, status: "تسویه شده" } : c
      )
    };
  });
}

function updateContractStatus(contractId: string, status: InstallmentContractStatus): void {
  installmentStore.setState((prev) => ({
    ...prev,
    contracts: prev.contracts.map((c) => (c.id === contractId ? { ...c, status } : c))
  }));
}

function paidInstallmentCount(contractId: string): number {
  return installmentStore.getState().payments.filter((p) => p.contractId === contractId).length;
}

/**
 * Estimates the next unpaid installment's due date: startDate + one month
 * per installment already paid. Returns null once the contract is fully
 * settled/cancelled — there's nothing left to be "due".
 */
export function getNextDueDate(contract: InstallmentContract, paidCount: number): Date | null {
  if (contract.status !== "در جریان") return null;
  const [y, m, d] = contract.startDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1 + paidCount + 1, d);
}

export function useInstallments() {
  const state = installmentStore.useStore();
  return {
    companies: state.companies,
    contracts: state.contracts,
    payments: state.payments,
    createCompany,
    createContract,
    recordPayment,
    updateContractStatus,
    paidInstallmentCount
  };
}

export const installmentActions = {
  createCompany,
  createContract,
  recordPayment,
  updateContractStatus,
  paidInstallmentCount,
  getState: installmentStore.getState
};
