import { useState, type FormEvent } from "react";
import { useCustomers } from "./useCustomers";

export function Customers(): JSX.Element {
  const { customers, addCustomer } = useCustomers();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;
    addCustomer({ fullName: fullName.trim(), phone: phone.trim(), loyaltyTier: "عادی" });
    setFullName("");
    setPhone("");
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
              <input id="cust-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
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
              <th>نام</th>
              <th>شماره تماس</th>
              <th>سطح باشگاه مشتریان</th>
              <th>تعداد خرید</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.fullName}</td>
                <td>{c.phone}</td>
                <td>{c.loyaltyTier}</td>
                <td>{c.totalPurchases}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
