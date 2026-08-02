import { useEffect, useState } from "react";
import { useSales } from "@/modules/sales/useSales";
import { useCustomers } from "@/modules/customers/useCustomers";
import { useRepairs } from "@/modules/repairs/useRepairs";
import { useInstallments } from "@/modules/installments/useInstallments";
import { DEFAULT_STORE_PROFILE, loadStoreProfile, type StoreProfile } from "@/lib/storeProfile";
import type { InstallmentContract, RepairTicket, SaleRecord } from "@shared/types";
import { formatDateForDisplay } from "@/lib/jalali";
import { usePendingSalePrint } from "@/state/printRequestStore";

type DocType = "invoice" | "repair-receipt" | "installment";

export function Printing(): JSX.Element {
  const { sales } = useSales();
  const { customers } = useCustomers();
  const { tickets } = useRepairs();
  const { contracts, paidInstallmentCount } = useInstallments();

  const [storeProfile, setStoreProfile] = useState<StoreProfile>(DEFAULT_STORE_PROFILE);
  const [docType, setDocType] = useState<DocType>("invoice");
  const [selectedSaleId, setSelectedSaleId] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [selectedContractId, setSelectedContractId] = useState("");
  const { pendingSaleId, clearPendingSaleId } = usePendingSalePrint();

  useEffect(() => {
    if (pendingSaleId) {
      setDocType("invoice");
      setSelectedSaleId(pendingSaleId);
      clearPendingSaleId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSaleId]);

  useEffect(() => {
    let cancelled = false;
    loadStoreProfile().then((profile) => {
      if (!cancelled) setStoreProfile(profile);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSale = sales.find((s) => s.id === selectedSaleId) ?? null;
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? null;
  const selectedContract = contracts.find((c) => c.id === selectedContractId) ?? null;

  function handlePrint(): void {
    window.print();
  }

  return (
    <div>
      <div className="card no-print">
        <h3 style={{ marginTop: 0 }}>چاپ فاکتور و رسید تعمیر</h3>
        <p style={{ color: "var(--sv-text-600)", marginTop: 0 }}>
          سربرگ (نام فروشگاه، لوگو، آدرس، تلفن، اطلاعات مالیاتی) از «تنظیمات ← تنظیمات پایهٔ فروشگاه»
          خوانده می‌شود.
        </p>
        <div className="form-row">
          <div>
            <label htmlFor="doc-type">نوع سند</label>
            <select id="doc-type" value={docType} onChange={(e) => setDocType(e.target.value as DocType)}>
              <option value="invoice">فاکتور فروش</option>
              <option value="repair-receipt">رسید تعمیر</option>
              <option value="installment">پروندهٔ فروش اقساطی</option>
            </select>
          </div>
          {docType === "invoice" ? (
            <div>
              <label htmlFor="doc-sale">فاکتور</label>
              <select id="doc-sale" value={selectedSaleId} onChange={(e) => setSelectedSaleId(e.target.value)}>
                <option value="">— انتخاب کنید —</option>
                {sales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.itemName} — {s.total.toLocaleString("fa-IR")} تومان ({formatDateForDisplay(s.createdAt)})
                  </option>
                ))}
              </select>
            </div>
          ) : docType === "repair-receipt" ? (
            <div>
              <label htmlFor="doc-ticket">تعمیر</label>
              <select id="doc-ticket" value={selectedTicketId} onChange={(e) => setSelectedTicketId(e.target.value)}>
                <option value="">— انتخاب کنید —</option>
                {tickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.deviceModel} — {t.customerName || "بدون نام"} ({t.status})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="doc-contract">پروندهٔ اقساط</label>
              <select id="doc-contract" value={selectedContractId} onChange={(e) => setSelectedContractId(e.target.value)}>
                <option value="">— انتخاب کنید —</option>
                {contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerName} — {c.itemDescription} ({c.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={handlePrint}
          disabled={docType === "invoice" ? !selectedSale : docType === "repair-receipt" ? !selectedTicket : !selectedContract}
        >
          چاپ
        </button>
      </div>

      <div className="card print-area" style={{ marginTop: 24 }}>
        <PrintHeader profile={storeProfile} />
        {docType === "invoice" ? (
          selectedSale ? (
            <InvoiceBody
              sale={selectedSale}
              customerName={customers.find((c) => c.id === selectedSale.customerId)?.fullName ?? null}
            />
          ) : (
            <p className="empty-state">یک فاکتور برای پیش‌نمایش انتخاب کنید.</p>
          )
        ) : docType === "repair-receipt" ? (
          selectedTicket ? (
            <RepairReceiptBody ticket={selectedTicket} />
          ) : (
            <p className="empty-state">یک تعمیر برای پیش‌نمایش انتخاب کنید.</p>
          )
        ) : selectedContract ? (
          <InstallmentContractBody contract={selectedContract} paidCount={paidInstallmentCount(selectedContract.id)} />
        ) : (
          <p className="empty-state">یک پروندهٔ اقساط برای پیش‌نمایش انتخاب کنید.</p>
        )}
      </div>
    </div>
  );
}

function PrintHeader({ profile }: { profile: StoreProfile }): JSX.Element {
  return (
    <div className="print-header">
      {profile.logoDataUrl ? <img src={profile.logoDataUrl} alt={profile.storeName} className="print-header__logo" /> : null}
      <div>
        <h2 style={{ margin: 0 }}>{profile.storeName || "نام فروشگاه ثبت نشده"}</h2>
        {profile.brand ? <p style={{ margin: 0, color: "var(--sv-text-600)" }}>{profile.brand}</p> : null}
        <p style={{ margin: 0, fontSize: 13, color: "var(--sv-text-600)" }}>
          {[profile.address, profile.phone, profile.taxId ? `شناسهٔ مالیاتی: ${profile.taxId}` : ""]
            .filter(Boolean)
            .join(" — ")}
        </p>
      </div>
    </div>
  );
}

function InvoiceBody({ sale, customerName }: { sale: SaleRecord; customerName: string | null }): JSX.Element {
  return (
    <div>
      <h3>فاکتور فروش</h3>
      <p>تاریخ: {formatDateForDisplay(sale.createdAt)}</p>
      {customerName ? <p>مشتری: {customerName}</p> : null}
      <table className="data-table">
        <thead>
          <tr>
            <th>کالا</th>
            <th>تعداد</th>
            <th>قیمت واحد</th>
            <th>جمع</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{sale.itemName}</td>
            <td>{sale.quantity}</td>
            <td>{sale.unitPrice.toLocaleString("fa-IR")}</td>
            <td>{sale.total.toLocaleString("fa-IR")}</td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontWeight: 700, marginTop: 12 }}>جمع کل: {sale.total.toLocaleString("fa-IR")} تومان</p>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string | number | null | undefined }): JSX.Element | null {
  if (value === null || value === undefined || value === "" || value === 0) return null;
  return (
    <tr>
      <td>{label}</td>
      <td>{value}</td>
    </tr>
  );
}

function RepairReceiptBody({ ticket }: { ticket: RepairTicket }): JSX.Element {
  const partsAndLabor =
    ticket.partsUsed || ticket.laborFee > 0
      ? `${ticket.partsUsed || "—"}${ticket.laborFee > 0 ? ` / ${ticket.laborFee.toLocaleString("fa-IR")} تومان` : ""}`
      : null;

  return (
    <div>
      <h3>رسید تعمیر</h3>
      <p>تاریخ ثبت: {formatDateForDisplay(ticket.createdAt)}</p>
      {ticket.customerName ? <p>مشتری: {ticket.customerName}</p> : null}
      <table className="data-table">
        <tbody>
          <ReceiptRow label="دستگاه" value={ticket.deviceModel} />
          <ReceiptRow label="IMEI" value={ticket.imei} />
          <ReceiptRow label="شماره سریال" value={ticket.serialNumber} />
          <ReceiptRow label="رمز / الگوی قفل" value={ticket.devicePassword} />
          <ReceiptRow label="شرح خرابی" value={ticket.faultDescription} />
          <ReceiptRow label="لوازم تحویلی" value={ticket.accessoriesReceived} />
          <ReceiptRow label="وضعیت" value={ticket.status} />
          <ReceiptRow label="تکنسین" value={ticket.technician} />
          <ReceiptRow label="تاریخ تحویل تخمینی" value={formatDateForDisplay(ticket.deliveryDate)} />
          <ReceiptRow label="قطعات و اجرت" value={partsAndLabor} />
        </tbody>
      </table>
      {ticket.customerSignature ? (
        <div style={{ marginTop: 16 }}>
          <p style={{ marginBottom: 4 }}>امضای مشتری:</p>
          <img src={ticket.customerSignature} alt="امضای مشتری" style={{ height: 80 }} />
        </div>
      ) : null}
    </div>
  );
}

export interface ScheduleRow {
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  paid: boolean;
}

export function buildInstallmentSchedule(contract: InstallmentContract, paidCount: number): ScheduleRow[] {
  const [startYear, startMonth, startDay] = contract.startDate.split("-").map(Number);

  return Array.from({ length: contract.installmentCount }, (_, index) => {
    const installmentNumber = index + 1;
    const dueDate = new Date(startYear, startMonth - 1 + installmentNumber, startDay);
    return {
      installmentNumber,
      dueDate,
      amount: contract.monthlyAmount,
      paid: installmentNumber <= paidCount
    };
  });
}

function InstallmentContractBody({ contract, paidCount }: { contract: InstallmentContract; paidCount: number }): JSX.Element {
  const schedule = buildInstallmentSchedule(contract, paidCount);

  return (
    <div>
      <h3>پروندهٔ فروش اقساطی</h3>
      <p>تاریخ ثبت: {formatDateForDisplay(contract.createdAt)}</p>
      <table className="data-table">
        <tbody>
          <ReceiptRow label="مشتری" value={contract.customerName} />
          <ReceiptRow label="شرح کالا" value={contract.itemDescription} />
          <ReceiptRow label="مبلغ کل" value={`${contract.totalAmount.toLocaleString("fa-IR")} تومان`} />
          <ReceiptRow
            label="پیش‌پرداخت"
            value={contract.downPayment > 0 ? `${contract.downPayment.toLocaleString("fa-IR")} تومان` : null}
          />
          <ReceiptRow label="تعداد اقساط" value={contract.installmentCount} />
          <ReceiptRow label="مبلغ هر قسط" value={`${contract.monthlyAmount.toLocaleString("fa-IR")} تومان`} />
          <ReceiptRow label="تاریخ شروع" value={formatDateForDisplay(contract.startDate)} />
          <ReceiptRow label="وضعیت پرونده" value={contract.status} />
          <ReceiptRow label="یادداشت ضمانت" value={contract.guaranteeNote} />
        </tbody>
      </table>

      <h3 style={{ marginTop: 16 }}>جدول اقساط</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>قسط</th>
            <th>سررسید</th>
            <th>مبلغ</th>
            <th>وضعیت</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => (
            <tr key={row.installmentNumber}>
              <td>{row.installmentNumber}</td>
              <td>{formatDateForDisplay(row.dueDate.toISOString())}</td>
              <td>{row.amount.toLocaleString("fa-IR")} تومان</td>
              <td>{row.paid ? "پرداخت‌شده" : "پرداخت‌نشده"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
