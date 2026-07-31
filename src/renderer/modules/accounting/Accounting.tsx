import { useState, type FormEvent } from "react";
import { useAccounting } from "./useAccounting";
import { useSortableRows } from "@/components/useSortableRows";
import { SortableTh } from "@/components/SortableTh";
import type { AccountingCategory, CashTransaction, CheckRecord } from "@shared/types";
import { formatDateForDisplay } from "@/lib/jalali";

const CATEGORIES: AccountingCategory[] = ["فروش", "خرید کالا", "اجاره", "حقوق", "قبوض", "سایر"];

export function Accounting(): JSX.Element {
  const { transactions, checks, summary, recordTransaction, recordCheck, updateCheckStatus } = useAccounting();
  const { sorted: sortedTxns, sortKey, direction, toggleSort } = useSortableRows<CashTransaction>(
    transactions,
    "date",
    "desc"
  );

  const [type, setType] = useState<"درآمد" | "هزینه">("هزینه");
  const [account, setAccount] = useState<"صندوق" | "بانک">("صندوق");
  const [category, setCategory] = useState<AccountingCategory>("سایر");
  const [amount, setAmount] = useState("0");
  const [description, setDescription] = useState("");

  const [checkDirection, setCheckDirection] = useState<"دریافتنی" | "پرداختنی">("دریافتنی");
  const [payerOrPayee, setPayerOrPayee] = useState("");
  const [checkAmount, setCheckAmount] = useState("0");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));

  function handleTransactionSubmit(event: FormEvent): void {
    event.preventDefault();
    if (!description.trim() || Number(amount) <= 0) return;
    recordTransaction({ type, account, category, amount: Number(amount), description: description.trim() });
    setAmount("0");
    setDescription("");
  }

  function handleCheckSubmit(event: FormEvent): void {
    event.preventDefault();
    if (!payerOrPayee.trim() || Number(checkAmount) <= 0) return;
    recordCheck({ direction: checkDirection, payerOrPayee: payerOrPayee.trim(), amount: Number(checkAmount), dueDate });
    setPayerOrPayee("");
    setCheckAmount("0");
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
              <label htmlFor="acc-amount">مبلغ (تومان)</label>
              <input id="acc-amount" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
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
            </tr>
          </thead>
          <tbody>
            {sortedTxns.map((t) => (
              <tr key={t.id}>
                <td>{formatDateForDisplay(t.date)}</td>
                <td className={t.type === "هزینه" ? "data-table__low-stock" : undefined}>{t.type}</td>
                <td>{t.account}</td>
                <td>{t.category}</td>
                <td>{t.amount.toLocaleString("fa-IR")}</td>
                <td>{t.description}</td>
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
              <label htmlFor="chk-amount">مبلغ (تومان)</label>
              <input id="chk-amount" type="number" min={0} value={checkAmount} onChange={(e) => setCheckAmount(e.target.value)} />
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
