import { useEffect, useState } from "react";
import { useSales } from "@/modules/sales/useSales";
import { useCustomers } from "@/modules/customers/useCustomers";
import { useRepairs } from "@/modules/repairs/useRepairs";
import { DEFAULT_STORE_PROFILE, loadStoreProfile, type StoreProfile } from "@/lib/storeProfile";
import type { RepairTicket, SaleRecord } from "@shared/types";
import { formatDateForDisplay } from "@/lib/jalali";

type DocType = "invoice" | "repair-receipt";

export function Printing(): JSX.Element {
  const { sales } = useSales();
  const { customers } = useCustomers();
  const { tickets } = useRepairs();

  const [storeProfile, setStoreProfile] = useState<StoreProfile>(DEFAULT_STORE_PROFILE);
  const [docType, setDocType] = useState<DocType>("invoice");
  const [selectedSaleId, setSelectedSaleId] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState("");

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
          ) : (
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
          )}
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={handlePrint}
          disabled={docType === "invoice" ? !selectedSale : !selectedTicket}
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
        ) : selectedTicket ? (
          <RepairReceiptBody ticket={selectedTicket} />
        ) : (
          <p className="empty-state">یک تعمیر برای پیش‌نمایش انتخاب کنید.</p>
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

function RepairReceiptBody({ ticket }: { ticket: RepairTicket }): JSX.Element {
  return (
    <div>
      <h3>رسید تعمیر</h3>
      <p>تاریخ ثبت: {formatDateForDisplay(ticket.createdAt)}</p>
      <p>مشتری: {ticket.customerName || "—"}</p>
      <table className="data-table">
        <tbody>
          <tr>
            <td>دستگاه</td>
            <td>{ticket.deviceModel}</td>
          </tr>
          <tr>
            <td>IMEI</td>
            <td>{ticket.imei || "—"}</td>
          </tr>
          <tr>
            <td>شرح خرابی</td>
            <td>{ticket.faultDescription}</td>
          </tr>
          <tr>
            <td>لوازم تحویلی</td>
            <td>{ticket.accessoriesReceived || "—"}</td>
          </tr>
          <tr>
            <td>وضعیت</td>
            <td>{ticket.status}</td>
          </tr>
          <tr>
            <td>تکنسین</td>
            <td>{ticket.technician || "—"}</td>
          </tr>
          <tr>
            <td>تاریخ تحویل تخمینی</td>
            <td>{formatDateForDisplay(ticket.deliveryDate)}</td>
          </tr>
          {ticket.partsUsed || ticket.laborFee > 0 ? (
            <tr>
              <td>قطعات و اجرت</td>
              <td>
                {ticket.partsUsed || "—"} / {ticket.laborFee.toLocaleString("fa-IR")} تومان
              </td>
            </tr>
          ) : null}
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
