import { useState, type FormEvent } from "react";
import { useInventory } from "@/modules/inventory/useInventory";
import { useCustomers } from "@/modules/customers/useCustomers";
import { useSales } from "./useSales";
import { useSortableRows } from "@/components/useSortableRows";
import { SortableTh } from "@/components/SortableTh";
import type { SaleRecord } from "@shared/types";

export function Sales(): JSX.Element {
  const { items } = useInventory();
  const { customers } = useCustomers();
  const { sales, recordSale } = useSales();
  const { sorted, sortKey, direction, toggleSort } = useSortableRows<SaleRecord>(sales, "createdAt", "desc");

  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [customerId, setCustomerId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    const result = recordSale({
      itemId,
      customerId: customerId || null,
      quantity: Number(quantity) || 0
    });

    if (result.ok) {
      setFeedback({ type: "success", text: "فروش با موفقیت ثبت شد." });
      setQuantity("1");
    } else {
      setFeedback({ type: "error", text: result.error });
    }
  }

  return (
    <div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>ثبت فروش سریع</h3>
        {items.length === 0 ? (
          <p className="empty-state">ابتدا از بخش «مدیریت کالا» یک کالا ثبت کنید.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div>
                <label htmlFor="sale-item">کالا</label>
                <select id="sale-item" value={itemId} onChange={(e) => setItemId(e.target.value)}>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — موجودی: {item.quantity}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sale-customer">مشتری (اختیاری)</label>
                <select id="sale-customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">بدون ثبت مشتری</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sale-qty">تعداد</label>
                <input
                  id="sale-qty"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              ثبت فروش
            </button>
            {feedback ? (
              <p
                style={{
                  marginTop: 12,
                  color: feedback.type === "error" ? "var(--sv-danger)" : "var(--sv-success)"
                }}
              >
                {feedback.text}
              </p>
            ) : null}
          </form>
        )}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>تاریخچهٔ فروش</h3>
        {sales.length === 0 ? (
          <p className="empty-state">هنوز فروشی ثبت نشده است.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <SortableTh label="کالا" sortKeyName="itemName" activeKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label="تعداد" sortKeyName="quantity" activeKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label="قیمت واحد" sortKeyName="unitPrice" activeKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label="مبلغ کل" sortKeyName="total" activeKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label="تاریخ" sortKeyName="createdAt" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
                <tr key={s.id}>
                  <td>{s.itemName}</td>
                  <td>{s.quantity}</td>
                  <td>{s.unitPrice.toLocaleString("fa-IR")} تومان</td>
                  <td>{s.total.toLocaleString("fa-IR")} تومان</td>
                  <td>{new Date(s.createdAt).toLocaleDateString("fa-IR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
