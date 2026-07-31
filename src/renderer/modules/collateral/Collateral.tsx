import { useState, type FormEvent } from "react";
import { useCollateral } from "./useCollateral";
import { useSortableRows } from "@/components/useSortableRows";
import { SortableTh } from "@/components/SortableTh";
import type { CollateralRecord, CollateralStatus, CollateralType } from "@shared/types";
import { formatDateForDisplay } from "@/lib/jalali";

const TYPES: CollateralType[] = ["چک", "طلا", "سفته", "ضامن", "سایر"];

export function Collateral(): JSX.Element {
  const { records, createCollateral, updateStatus, isNearDue } = useCollateral();
  const { sorted, sortKey, direction, toggleSort } = useSortableRows<CollateralRecord>(records, "dueDate", "asc");

  const [type, setType] = useState<CollateralType>("چک");
  const [relatedTo, setRelatedTo] = useState("");
  const [description, setDescription] = useState("");
  const [guarantorName, setGuarantorName] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    if (!description.trim()) return;
    createCollateral({
      type,
      relatedTo: relatedTo.trim(),
      description: description.trim(),
      guarantorName: guarantorName.trim(),
      dueDate
    });
    setRelatedTo("");
    setDescription("");
    setGuarantorName("");
  }

  const nearDueCount = records.filter(isNearDue).length;

  return (
    <div>
      {nearDueCount > 0 ? (
        <div className="card" style={{ borderColor: "var(--sv-warning)" }}>
          <p style={{ margin: 0, color: "var(--sv-warning)", fontWeight: 600 }}>
            {nearDueCount} مورد ضمانت به سررسید نزدیک شده یا سررسیدش گذشته — لطفاً بررسی کنید.
          </p>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: nearDueCount > 0 ? 24 : 0 }}>
        <h3 style={{ marginTop: 0 }}>ثبت ضمانت جدید</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div>
              <label htmlFor="col-type">نوع ضمانت</label>
              <select id="col-type" value={type} onChange={(e) => setType(e.target.value as CollateralType)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="col-related">مربوط به (فروش/تعمیر/قسط)</label>
              <input id="col-related" value={relatedTo} onChange={(e) => setRelatedTo(e.target.value)} placeholder="مثلاً: پروندهٔ اقساط محمدی" />
            </div>
            <div>
              <label htmlFor="col-guarantor">نام ضامن / صادرکننده</label>
              <input id="col-guarantor" value={guarantorName} onChange={(e) => setGuarantorName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="col-due">سررسید</label>
              <input id="col-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="col-desc">توضیحات (شمارهٔ چک/سفته و غیره)</label>
              <input id="col-desc" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            ثبت ضمانت
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>لیست ضمانت‌ها</h3>
        <table className="data-table">
          <thead>
            <tr>
              <SortableTh label="نوع" sortKeyName="type" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="مربوط به" sortKeyName="relatedTo" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="ضامن" sortKeyName="guarantorName" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="سررسید" sortKeyName="dueDate" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((record) => (
              <tr key={record.id}>
                <td>{record.type}</td>
                <td>{record.relatedTo || "—"}</td>
                <td>{record.guarantorName || "—"}</td>
                <td className={isNearDue(record) ? "data-table__low-stock" : undefined}>{formatDateForDisplay(record.dueDate)}</td>
                <td>
                  <select
                    value={record.status}
                    onChange={(e) => updateStatus(record.id, e.target.value as CollateralStatus)}
                  >
                    <option value="معتبر">معتبر</option>
                    <option value="بازگردانده شده">بازگردانده شده</option>
                    <option value="ضبط شده">ضبط شده</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
