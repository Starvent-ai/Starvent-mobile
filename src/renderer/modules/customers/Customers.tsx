import { useState, type FormEvent } from "react";
import { useCustomers } from "./useCustomers";
import { useSortableRows } from "@/components/useSortableRows";
import { SortableTh } from "@/components/SortableTh";
import type { Customer, LoyaltyTier } from "@shared/types";

const LOYALTY_TIERS: LoyaltyTier[] = ["عادی", "نقره‌ای", "طلایی", "ویژه"];

export function Customers(): JSX.Element {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { sorted, sortKey, direction, toggleSort } = useSortableRows<Customer>(customers, "fullName");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdayMonthDay, setBirthdayMonthDay] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editTier, setEditTier] = useState<LoyaltyTier>("عادی");
  const [editBirthday, setEditBirthday] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;
    addCustomer({
      fullName: fullName.trim(),
      phone: phone.trim(),
      loyaltyTier: "عادی",
      birthdayMonthDay: birthdayMonthDay || undefined
    });
    setFullName("");
    setPhone("");
    setBirthdayMonthDay("");
  }

  function startEdit(customer: Customer): void {
    setEditingId(customer.id);
    setEditName(customer.fullName);
    setEditPhone(customer.phone);
    setEditTier(customer.loyaltyTier);
    setEditBirthday(customer.birthdayMonthDay ?? "");
    setConfirmDeleteId(null);
  }

  function cancelEdit(): void {
    setEditingId(null);
  }

  function saveEdit(customerId: string): void {
    if (!editName.trim() || !editPhone.trim()) return;
    updateCustomer(customerId, {
      fullName: editName.trim(),
      phone: editPhone.trim(),
      loyaltyTier: editTier,
      birthdayMonthDay: editBirthday || undefined
    });
    setEditingId(null);
  }

  function handleDeleteClick(customerId: string): void {
    if (confirmDeleteId === customerId) {
      deleteCustomer(customerId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(customerId);
    }
  }

  return (
    <div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>ثبت مشتری جدید</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div>
              <label htmlFor="cust-name">نام و نام خانوادگی</label>
              <input id="cust-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="cust-phone">شماره تماس</label>
              <input
                id="cust-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                inputMode="numeric"
                maxLength={11}
                required
              />
            </div>
            <div>
              <label htmlFor="cust-birthday-day">روز تولد</label>
              <input
                id="cust-birthday-day"
                type="number"
                min={1}
                max={31}
                placeholder="روز"
                value={birthdayMonthDay ? String(Number(birthdayMonthDay.split("-")[1])) : ""}
                onChange={(e) => {
                  const day = e.target.value.padStart(2, "0");
                  const month = birthdayMonthDay ? birthdayMonthDay.split("-")[0] : "01";
                  setBirthdayMonthDay(e.target.value ? `${month}-${day}` : "");
                }}
              />
            </div>
            <div>
              <label htmlFor="cust-birthday-month">ماه تولد</label>
              <input
                id="cust-birthday-month"
                type="number"
                min={1}
                max={12}
                placeholder="ماه"
                value={birthdayMonthDay ? String(Number(birthdayMonthDay.split("-")[0])) : ""}
                onChange={(e) => {
                  const month = e.target.value.padStart(2, "0");
                  const day = birthdayMonthDay ? birthdayMonthDay.split("-")[1] : "01";
                  setBirthdayMonthDay(e.target.value ? `${month}-${day}` : "");
                }}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            ثبت مشتری
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>لیست مشتریان</h3>
        <table className="data-table">
          <thead>
            <tr>
              <SortableTh label="نام" sortKeyName="fullName" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="شماره تماس" sortKeyName="phone" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="سطح باشگاه مشتریان" sortKeyName="loyaltyTier" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="تعداد خرید" sortKeyName="totalPurchases" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <th>تولد</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) =>
              editingId === c.id ? (
                <tr key={c.id}>
                  <td>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </td>
                  <td>
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      inputMode="numeric"
                      maxLength={11}
                    />
                  </td>
                  <td>
                    <select value={editTier} onChange={(e) => setEditTier(e.target.value as LoyaltyTier)}>
                      {LOYALTY_TIERS.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{c.totalPurchases}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        placeholder="روز"
                        style={{ width: 48 }}
                        value={editBirthday ? String(Number(editBirthday.split("-")[1])) : ""}
                        onChange={(e) => {
                          const day = e.target.value.padStart(2, "0");
                          const month = editBirthday ? editBirthday.split("-")[0] : "01";
                          setEditBirthday(e.target.value ? `${month}-${day}` : "");
                        }}
                      />
                      <input
                        type="number"
                        min={1}
                        max={12}
                        placeholder="ماه"
                        style={{ width: 48 }}
                        value={editBirthday ? String(Number(editBirthday.split("-")[0])) : ""}
                        onChange={(e) => {
                          const month = e.target.value.padStart(2, "0");
                          const day = editBirthday ? editBirthday.split("-")[1] : "01";
                          setEditBirthday(e.target.value ? `${month}-${day}` : "");
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="btn-primary" onClick={() => saveEdit(c.id)}>
                      ذخیره
                    </button>
                    <button type="button" className="btn-secondary" onClick={cancelEdit}>
                      انصراف
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={c.id}>
                  <td>{c.fullName}</td>
                  <td>{c.phone}</td>
                  <td>{c.loyaltyTier}</td>
                  <td>{c.totalPurchases}</td>
                  <td>
                    {c.birthdayMonthDay
                      ? `${Number(c.birthdayMonthDay.split("-")[1])}/${Number(c.birthdayMonthDay.split("-")[0])}`
                      : "—"}
                  </td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="btn-secondary" onClick={() => startEdit(c)}>
                      ویرایش
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={confirmDeleteId === c.id ? { borderColor: "var(--sv-warning)", color: "var(--sv-warning)" } : undefined}
                      onClick={() => handleDeleteClick(c.id)}
                    >
                      {confirmDeleteId === c.id ? "مطمئن هستید؟ حذف" : "حذف"}
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
