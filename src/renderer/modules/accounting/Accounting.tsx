import { useMemo, useState, type FormEvent } from "react";
import { useAccounting } from "./useAccounting";
import { CurrencyInput } from "@/components/CurrencyInput";
import { useSortableRows } from "@/components/useSortableRows";
import { SortableTh } from "@/components/SortableTh";
import { AccountingBarChart } from "@/components/AccountingBarChart";
import { buildPeriodBuckets, type AccountingPeriod } from "@/lib/periodAggregation";
import type { AccountingCategory, CashTransaction, CheckRecord } from "@shared/types";
import { formatDateForDisplay } from "@/lib/jalali";

const CATEGORIES: AccountingCategory[] = ["فروش", "خرید کالا", "اجاره", "حقوق", "قبوض", "سایر"];
const PERIODS: AccountingPeriod[] = ["روزانه", "هفتگی", "ماهانه", "سالانه"];

export function Accounting(): JSX.Element {
  const { transactions, checks, summary, recordTransaction, voidTransaction, recordCheck, updateCheckStatus } = useAccounting();
  const { sorted: sortedTxns, sortKey, direction, toggleSort } = useSortableRows<CashTransaction>(
    transactions,
    "date",
    "desc"
  );

  const [type, setType] = useState<"درآمد" | "هزینه">("هزینه");
  const [account, setAccount] = useState<"صندوق" | "بانک">("صندوق");
  const [category, setCategory] = useState<AccountingCategory>("سایر");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");

  const [checkDirection, setCheckDirection] = useState<"دریافتنی" | "پرداختنی">("دریافتنی");
  const [payerOrPayee, setPayerOrPayee] = useState("");
  const [checkAmount, setCheckAmount] = useState(0);
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));

  const [period, setPeriod] = useState<AccountingPeriod>("روزانه");
  const buckets = useMemo(() => buildPeriodBuckets(transactions, period), [transactions, period]);
  const periodIncome = buckets.reduce((sum, b) => sum + b.income, 0);
  const periodExpense = buckets.reduce((sum, b) => sum + b.expense, 0);

  function handleTransactionSubmit(event: FormEvent): void {
    event.preventDefault();
    if (!description.trim() || amount <= 0) return;
    recordTransaction({ type, account, category, amount, description: description.trim() });
    setAmount(0);
    setDescription("");
  }

  function handleCheckSubmit(event: FormEvent): void {
    event.preventDefault();
    if (!payerOrPayee.trim() || checkAmount <= 0) return;
    recordCheck({ direction: checkDirection, payerOrPayee: payerOrPayee.trim(), amount: checkAmount, dueDate });
    setPayerOrPayee("");
    setCheckAmount(0);
  }

  return (
    <div>
      <div className="stat-grid">
        <SummaryCard title="موجودی صندوق" value={summary.cashBalance} />
        <SummaryCard title="موجودی بانک" value={summary.bankBalance} />
        <SummaryCard title="مجموع درآمد" value={summary.totalIncome} />
        <SummaryCard title="مجموع هزینه" value={summary.totalExpense} />
        <SummaryCard title="سود خالص" value={summary.netProfit} highlight={summary.netProfit >= 0} />
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <h3 style={{ margin: 0 }}>روند درآمد و هزینه</h3>
          <div style={{ display: "flex", gap: 6 }}>
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                className={p === period ? "btn-primary" : "btn-secondary"}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 12, marginBottom: 12, fontSize: 13 }}>
          <span style={{ color: "var(--sv-success)" }}>■ درآمد: {periodIncome.toLocaleString("fa-IR")} تومان</span>
          <span style={{ color: "var(--sv-danger)" }}>■ هزینه: {periodExpense.toLocaleString("fa-IR")} تومان</span>
        </div>

        <AccountingBarChart buckets={buckets} />

        <table className="data-table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>بازه</th>
              <th>درآمد</th>
              <th>هزینه</th>
              <th>خالص</th>
            </tr>
          </thead>
          <tbody>
            {buckets
              .slice()
              .reverse()
              .map((b) => (
                <tr key={b.key}>
                  <td>{b.label}</td>
                  <td>{b.income.toLocaleString("fa-IR")}</td>
                  <td>{b.expense.toLocaleString("fa-IR")}</td>
                  <td className={b.income - b.expense < 0 ? "data-table__low-stock" : undefined}>
                    {(b.income - b.expense).toLocaleString("fa-IR")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>ثبت هزینه / درآمد</h3>
        <form onSubmit={handleTransactionSubmit}>
          <div className="form-row">
            <div>
              <label htmlFor="acc-type">نوع</label>
              <select id="acc-type" value={type} onChange={(e) => setType(e.target.value as "درآمد" | "هزینه")}>
                <option value="هزینه">هزینه</option>
                <option value="درآمد">درآمد</option>
              </select>
            </div>
            <div>
              <label htmlFor="acc-account">حساب</label>
              <select id="acc-account" value={account} onChange={(e) => setAccount(e.target.value as "صندوق" | "بانک")}>
                <option value="صندوق">صندوق</option>
                <option value="بانک">بانک</option>
              </select>
            </div>
            <div>
              <label htmlFor="acc-category">دسته‌بندی</label>
              <select id="acc-category" value={category} onChange={(e) => setCategory(e.target.value as AccountingCategory)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="acc-amount">مبلغ</label>
              <CurrencyInput id="acc-amount" value={amount} onChange={setAmount} />
            </div>
          </div>
          <div className="form-row">
            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="acc-desc">شرح</label>
              <input id="acc-desc" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            ثبت تراکنش
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>تراکنش‌ها</h3>
        <table className="data-table">
          <thead>
            <tr>
              <SortableTh label="تاریخ" sortKeyName="date" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="نوع" sortKeyName="type" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="حساب" sortKeyName="account" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="دسته" sortKeyName="category" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="مبلغ" sortKeyName="amount" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <th>شرح</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {sortedTxns.map((t) => (
              <tr key={t.id} style={t.voided ? { opacity: 0.5, textDecoration: "line-through" } : undefined}>
                <td>{formatDateForDisplay(t.date)}</td>
                <td className={t.type === "هزینه" ? "data-table__low-stock" : undefined}>{t.type}</td>
                <td>{t.account}</td>
                <td>{t.category}</td>
                <td>{t.amount.toLocaleString("fa-IR")}</td>
                <td>{t.description}</td>
                <td style={{ textDecoration: "none" }}>
                  {t.voided ? (
                    <span style={{ color: "var(--sv-text-600)" }}>باطل شده</span>
                  ) : (
                    <button type="button" className="btn-secondary" onClick={() => voidTransaction(t.id)}>
                      ابطال
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>چک‌ها</h3>
        <form onSubmit={handleCheckSubmit}>
          <div className="form-row">
            <div>
              <label htmlFor="chk-direction">نوع چک</label>
              <select id="chk-direction" value={checkDirection} onChange={(e) => setCheckDirection(e.target.value as "دریافتنی" | "پرداختنی")}>
                <option value="دریافتنی">دریافتنی</option>
                <option value="پرداختنی">پرداختنی</option>
              </select>
            </div>
            <div>
              <label htmlFor="chk-person">طرف حساب</label>
              <input id="chk-person" value={payerOrPayee} onChange={(e) => setPayerOrPayee(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="chk-amount">مبلغ</label>
              <CurrencyInput id="chk-amount" value={checkAmount} onChange={setCheckAmount} />
            </div>
            <div>
              <label htmlFor="chk-due">سررسید</label>
              <input id="chk-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            ثبت چک
          </button>
        </form>

        {checks.length > 0 ? (
          <table className="data-table" style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th>نوع</th>
                <th>طرف حساب</th>
                <th>مبلغ</th>
                <th>سررسید</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((c) => (
                <tr key={c.id}>
                  <td>{c.direction}</td>
                  <td>{c.payerOrPayee}</td>
                  <td>{c.amount.toLocaleString("fa-IR")}</td>
                  <td>{formatDateForDisplay(c.dueDate)}</td>
                  <td>
                    <select value={c.status} onChange={(e) => updateCheckStatus(c.id, e.target.value as CheckRecord["status"])}>
                      <option value="در جریان">در جریان</option>
                      <option value="وصول شده">وصول شده</option>
                      <option value="برگشتی">برگشتی</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, highlight }: { title: string; value: number; highlight?: boolean }): JSX.Element {
  return (
    <div className="stat-card">
      <span className="stat-card__label">{title}</span>
      <span className={highlight === false ? "stat-card__value data-table__low-stock" : "stat-card__value"}>
        {value.toLocaleString("fa-IR")} تومان
      </span>
    </div>
  );
}
