import { useState, type FormEvent } from "react";
import { useInventory } from "./useInventory";

export function Inventory(): JSX.Element {
  const { items, addItem } = useInventory();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("موبایل");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [salePrice, setSalePrice] = useState("");

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    addItem({
      name: name.trim(),
      category,
      sku: sku.trim(),
      quantity: Number(quantity) || 0,
      purchasePrice: 0,
      salePrice: Number(salePrice) || 0,
      lowStockThreshold: 3
    });

    setName("");
    setSku("");
    setQuantity("1");
    setSalePrice("");
  }

  return (
    <div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>افزودن کالای جدید</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div>
              <label htmlFor="item-name">نام کالا</label>
              <input id="item-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="item-category">دسته‌بندی</label>
              <select id="item-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>موبایل</option>
                <option>تبلت</option>
                <option>ساعت هوشمند</option>
                <option>هدفون</option>
                <option>پاوربانک</option>
                <option>قاب</option>
                <option>قطعات تعمیرات</option>
              </select>
            </div>
            <div>
              <label htmlFor="item-sku">کد کالا / SKU</label>
              <input id="item-sku" value={sku} onChange={(e) => setSku(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="item-qty">موجودی اولیه</label>
              <input id="item-qty" type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <label htmlFor="item-price">قیمت فروش (تومان)</label>
              <input id="item-price" type="number" min={0} value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            ثبت کالا
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>موجودی انبار</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>نام کالا</th>
              <th>دسته‌بندی</th>
              <th>کد کالا</th>
              <th>موجودی</th>
              <th>قیمت فروش</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.sku}</td>
                <td className={item.quantity <= item.lowStockThreshold ? "data-table__low-stock" : undefined}>
                  {item.quantity}
                  {item.quantity <= item.lowStockThreshold ? " (کمبود موجودی)" : ""}
                </td>
                <td>{item.salePrice.toLocaleString("fa-IR")} تومان</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
