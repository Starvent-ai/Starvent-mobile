import { createStore } from "@/state/createStore";
import type { AccountingCategory, CashTransaction, CheckRecord } from "@shared/types";

interface AccountingState {
  transactions: CashTransaction[];
  checks: CheckRecord[];
}

const accountingStore = createStore<AccountingState>({ transactions: [], checks: [] });

interface NewTransactionInput {
  type: "درآمد" | "هزینه";
  account: "صندوق" | "بانک";
  category: AccountingCategory;
  amount: number;
  description: string;
}

function recordTransaction(input: NewTransactionInput): void {
  const transaction: CashTransaction = {
    ...input,
    id: `txn-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString()
  };
  accountingStore.setState((prev) => ({ ...prev, transactions: [...prev.transactions, transaction] }));
}

interface NewCheckInput {
  direction: "دریافتنی" | "پرداختنی";
  payerOrPayee: string;
  amount: number;
  dueDate: string;
}

function recordCheck(input: NewCheckInput): void {
  const check: CheckRecord = {
    ...input,
    id: `chk-${Date.now()}`,
    status: "در جریان",
    createdAt: new Date().toISOString()
  };
  accountingStore.setState((prev) => ({ ...prev, checks: [...prev.checks, check] }));
}

function updateCheckStatus(checkId: string, status: CheckRecord["status"]): void {
  accountingStore.setState((prev) => ({
    ...prev,
    checks: prev.checks.map((c) => (c.id === checkId ? { ...c, status } : c))
  }));
}

export interface AccountingSummary {
  cashBalance: number;
  bankBalance: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}

function computeSummary(transactions: CashTransaction[]): AccountingSummary {
  let cashBalance = 0;
  let bankBalance = 0;
  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    const signed = t.type === "درآمد" ? t.amount : -t.amount;
    if (t.account === "صندوق") cashBalance += signed;
    else bankBalance += signed;

    if (t.type === "درآمد") totalIncome += t.amount;
    else totalExpense += t.amount;
  }

  return { cashBalance, bankBalance, totalIncome, totalExpense, netProfit: totalIncome - totalExpense };
}

export function useAccounting() {
  const state = accountingStore.useStore();
  return {
    transactions: state.transactions,
    checks: state.checks,
    summary: computeSummary(state.transactions),
    recordTransaction,
    recordCheck,
    updateCheckStatus
  };
}

export const accountingActions = {
  recordTransaction,
  recordCheck,
  updateCheckStatus,
  getState: accountingStore.getState
};
