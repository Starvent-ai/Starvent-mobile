import { useState, type FormEvent } from "react";
import { useSuppliers } from "./useSuppliers";
import { useSortableRows } from "@/components/useSortableRows";
import { SortableTh } from "@/components/SortableTh";
import type { Supplier } from "@shared/types";
import { formatDateForDisplay } from "@/lib/jalali";

export function Suppliers(): JSX.Element {
  const { suppliers, purchases, createSupplier, recordPurchase, settleBalance, setRating } = useSuppliers();
  const { sorted, sortKey, direction, toggleSort } = useSortableRows<Supplier>(suppliers, "name", "asc");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [contractNotes, setContractNotes] = useState("");

  const [purchaseSupplierId, setPurchaseSupplierId] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [paid, setPaid] = useState(false);

  const [settleSupplierId, setSettleSupplierId] = useState("");
  const [settleAmount, setSettleAmount] = useState("0");

  function handleCreateSupplier(event: FormEvent): void {
    event.preventDefault();
    if (!name.trim()) return;
    createSupplier({ name: name.trim(), phone: phone.trim(), address: address.trim(), contractNotes: contractNotes.trim() });
    setName("");
    setPhone("");
    setAddress("");
    setContractNotes("");
  }

  function handleRecordPurchase(event: FormEvent): void {
    event.preventDefault();
    if (!purchaseSupplierId || !itemDescription.trim()) return;
    recordPurchase({
      supplierId: purchaseSupplierId,
      itemDescription: itemDescription.trim(),
      amount: Number(amount) || 0,
      paid
    });
    setItemDescription("");
    setAmount("0");
    setPaid(false);
  }

  function handleSettle(event: FormEvent): void {
    event.preventDefault();
    if (!settleSupplierId) return;
    settleBalance(settleSupplierId, Number(settleAmount) || 0);
    setSettleAmount("0");
  }

  return (
    <div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>ثبت تأمین‌کنندهٔ جدید</h3>
        <form onSubmit={handleCreateSupplier}>
          <div className="form-row">
            <div>
              <label htmlFor="sup-name">نام</label>
              <input id="sup-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="sup-phone">تلفن</label>
              <input
                id="sup-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                inputMode="numeric"
                maxLength={11}
              />
            </div>
            <div>
              <label htmlFor="sup-address">آدرس</label>
              <input id="sup-address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <label htmlFor="sup-contract">یادداشت قرارداد</label>
              <input id="sup-contract" value={contractNotes} onChange={(e) => setContractNotes(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            ثبت تأمین‌کننده
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>لیست تأمین‌کنندگان</h3>
        <table className="data-table">
          <thead>
            <tr>
              <SortableTh label="نام" sortKeyName="name" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="تلفن" sortKeyName="phone" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="بدهی/بستانکاری" sortKeyName="balance" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="امتیاز" sortKeyName="rating" activeKey={sortKey} direction={direction} onSort={toggleSort} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.phone || "—"}</td>
                <td className={s.balance > 0 ? "data-table__low-stock" : undefined}>
                  {s.balance > 0 ? `${s.balance.toLocaleString("fa-IR")} (بدهکاریم)` : s.balance < 0 ? `${Math.abs(s.balance).toLocaleString("fa-IR")} (طلبکاریم)` : "تسویه"}
                </td>
                <td>
                  <select value={s.rating} onChange={(e) => setRating(s.id, Number(e.target.value))}>
                    {[0, 1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {r} ⭐
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>ثبت خرید از تأمین‌کننده</h3>
        <form onSubmit={handleRecordPurchase}>
          <div className="form-row">
            <div>
              <label htmlFor="pur-supplier">تأمین‌کننده</label>
              <select id="pur-supplier" value={purchaseSupplierId} onChange={(e) => setPurchaseSupplierId(e.target.value)} required>
                <option value="">— انتخاب کنید —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pur-desc">شرح کالا</label>
              <input id="pur-desc" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="pur-amount">مبلغ (تومان)</label>
              <input id="pur-amount" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label htmlFor="pur-paid">وضعیت پرداخت</label>
              <select id="pur-paid" value={paid ? "paid" : "unpaid"} onChange={(e) => setPaid(e.target.value === "paid")}>
                <option value="unpaid">نسیه (به بدهی اضافه شود)</option>
                <option value="paid">نقدی پرداخت شد</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">
            ثبت خرید
          </button>
        </form>

        {purchases.length > 0 ? (
          <table className="data-table" style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th>تاریخ</th>
                <th>تأمین‌کننده</th>
                <th>شرح</th>
                <th>مبلغ</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td>{formatDateForDisplay(p.date)}</td>
                  <td>{suppliers.find((s) => s.id === p.supplierId)?.name ?? "—"}</td>
                  <td>{p.itemDescription}</td>
                  <td>{p.amount.toLocaleString("fa-IR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>تسویهٔ بدهی</h3>
        <form onSubmit={handleSettle}>
          <div className="form-row">
            <div>
              <label htmlFor="settle-supplier">تأمین‌کننده</label>
              <select id="settle-supplier" value={settleSupplierId} onChange={(e) => setSettleSupplierId(e.target.value)} required>
                <option value="">— انتخاب کنید —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="settle-amount">مبلغ تسویه‌شده (تومان)</label>
              <input id="settle-amount" type="number" min={0} value={settleAmount} onChange={(e) => setSettleAmount(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            ثبت تسویه
          </button>
        </form>
      </div>
    </div>
  );
}
