import { useState, type FormEvent } from "react";
import { useInstallments } from "./useInstallments";
import { useSortableRows } from "@/components/useSortableRows";
import { SortableTh } from "@/components/SortableTh";
import type { InstallmentContract, InstallmentContractStatus } from "@shared/types";

export function InstallmentSales(): JSX.Element {
  const { companies, contracts, createCompany, createContract, recordPayment, updateContractStatus, paidInstallmentCount } =
    useInstallments();
  const { sorted, sortKey, direction, toggleSort } = useSortableRows<InstallmentContract>(
    contracts,
    "createdAt",
    "desc"
  );

  const [companyName, setCompanyName] = useState("");
  const [companyTerms, setCompanyTerms] = useState("");

  const [companyId, setCompanyId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("0");
  const [downPayment, setDownPayment] = useState("0");
  const [installmentCount, setInstallmentCount] = useState("6");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [guaranteeNote, setGuaranteeNote] = useState("");

  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("0");

  function handleCreateCompany(event: FormEvent): void {
    event.preventDefault();
    if (!companyName.trim()) return;
    createCompany(companyName.trim(), companyTerms.trim());
    setCompanyName("");
    setCompanyTerms("");
  }

  function handleCreateContract(event: FormEvent): void {
    event.preventDefault();
    if (!customerName.trim() || !itemDescription.trim()) return;
    createContract({
      companyId: companyId || null,
      customerName: customerName.trim(),
      itemDescription: itemDescription.trim(),
      totalAmount: Number(totalAmount) || 0,
      downPayment: Number(downPayment) || 0,
      installmentCount: Number(installmentCount) || 1,
      startDate,
      guaranteeNote: guaranteeNote.trim()
    });
    setCustomerName("");
    setItemDescription("");
    setTotalAmount("0");
    setDownPayment("0");
    setGuaranteeNote("");
  }

  function handleRecordPayment(event: FormEvent): void {
    event.preventDefault();
    if (!selectedContractId || Number(paymentAmount) <= 0) return;
    recordPayment(selectedContractId, Number(paymentAmount));
    setPaymentAmount("0");
  }

  const selectedContract = contracts.find((c) => c.id === selectedContractId) ?? null;

  return (
    <div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>شرکت‌های طرف قرارداد اقساط</h3>
        <form onSubmit={handleCreateCompany}>
          <div className="form-row">
            <div>
              <label htmlFor="ic-name">نام شرکت</label>
              <input id="ic-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ic-terms">شرایط قرارداد</label>
              <input id="ic-terms" value={companyTerms} onChange={(e) => setCompanyTerms(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            افزودن شرکت
          </button>
        </form>
        {companies.length > 0 ? (
          <ul style={{ marginTop: 12, color: "var(--sv-text-400)" }}>
            {companies.map((c) => (
              <li key={c.id}>
                {c.name} — {c.terms || "بدون توضیح"}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>ثبت پروندهٔ فروش اقساطی جدید</h3>
        <form onSubmit={handleCreateContract}>
          <div className="form-row">
            <div>
              <label htmlFor="con-company">شرکت طرف قرارداد</label>
              <select id="con-company" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                <option value="">— بدون واسطه —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="con-customer">نام مشتری</label>
              <input id="con-customer" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="con-item">شرح کالا</label>
              <input id="con-item" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="con-start">تاریخ شروع</label>
              <input id="con-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="con-total">مبلغ کل (تومان)</label>
              <input id="con-total" type="number" min={0} value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
            </div>
            <div>
              <label htmlFor="con-down">پیش‌پرداخت (تومان)</label>
              <input id="con-down" type="number" min={0} value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />
            </div>
            <div>
              <label htmlFor="con-count">تعداد اقساط</label>
              <input id="con-count" type="number" min={1} value={installmentCount} onChange={(e) => setInstallmentCount(e.target.value)} />
            </div>
            <div>
              <label htmlFor="con-guarantee">یادداشت ضمانت</label>
              <input id="con-guarantee" value={guaranteeNote} onChange={(e) => setGuaranteeNote(e.target.value)} placeholder="مثلاً: چک شمارهٔ ..." />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            ثبت پرونده
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>پرونده‌های اقساطی</h3>
        <table className="data-table">
          <thead>
            <tr>
              <SortableTh label="مشتری" sortKeyName="customerName" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="کالا" sortKeyName="itemDescription" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="قسط ماهانه" sortKeyName="monthlyAmount" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="وضعیت" sortKeyName="status" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <th>پرداخت‌شده</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((contract) => (
              <tr key={contract.id}>
                <td>{contract.customerName}</td>
                <td>{contract.itemDescription}</td>
                <td>{Math.round(contract.monthlyAmount).toLocaleString("fa-IR")}</td>
                <td>
                  <select
                    value={contract.status}
                    onChange={(e) => updateContractStatus(contract.id, e.target.value as InstallmentContractStatus)}
                  >
                    <option value="در جریان">در جریان</option>
                    <option value="معوق">معوق</option>
                    <option value="تسویه شده">تسویه شده</option>
                  </select>
                </td>
                <td>
                  {paidInstallmentCount(contract.id)} از {contract.installmentCount}
                </td>
                <td>
                  <button type="button" className="btn-secondary" onClick={() => setSelectedContractId(contract.id)}>
                    ثبت قسط
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedContract ? (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginTop: 0 }}>
            ثبت پرداخت قسط — {selectedContract.customerName}
          </h3>
          <form onSubmit={handleRecordPayment}>
            <div className="form-row">
              <div>
                <label htmlFor="pay-amount">مبلغ قسط (تومان)</label>
                <input
                  id="pay-amount"
                  type="number"
                  min={0}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              ثبت پرداخت
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
