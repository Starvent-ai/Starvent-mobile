import { useEffect, useState, type ChangeEvent } from "react";
import {
  DEFAULT_STORE_PROFILE,
  loadStoreProfile,
  saveStoreProfile,
  type PaperSize,
  type StoreProfile
} from "@/lib/storeProfile";

const PAPER_SIZES: PaperSize[] = ["A4", "80mm", "58mm"];

export function StoreSettings(): JSX.Element {
  const [profile, setProfile] = useState<StoreProfile>(DEFAULT_STORE_PROFILE);
  const [status, setStatus] = useState<"idle" | "loading" | "saved">("loading");

  useEffect(() => {
    let cancelled = false;
    loadStoreProfile().then((loaded) => {
      if (cancelled) return;
      setProfile(loaded);
      setStatus("idle");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof StoreProfile>(key: K, value: StoreProfile[K]): void {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function handleLogoPick(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") update("logoDataUrl", reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(): Promise<void> {
    setStatus("loading");
    await saveStoreProfile(profile);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1800);
  }

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <h3 style={{ marginTop: 0 }}>تنظیمات پایهٔ فروشگاه</h3>

      <div className="form-row">
        <div>
          <label htmlFor="ss-name">نام فروشگاه</label>
          <input id="ss-name" value={profile.storeName} onChange={(e) => update("storeName", e.target.value)} />
        </div>
        <div>
          <label htmlFor="ss-brand">برند</label>
          <input id="ss-brand" value={profile.brand} onChange={(e) => update("brand", e.target.value)} />
        </div>
        <div>
          <label htmlFor="ss-phone">تلفن</label>
          <input
            id="ss-phone"
            value={profile.phone}
            onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 11))}
            inputMode="numeric"
            maxLength={11}
          />
        </div>
        <div>
          <label htmlFor="ss-tax">اطلاعات مالیاتی (شناسهٔ اقتصادی)</label>
          <input id="ss-tax" value={profile.taxId} onChange={(e) => update("taxId", e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="ss-address">آدرس</label>
          <input id="ss-address" value={profile.address} onChange={(e) => update("address", e.target.value)} />
        </div>
      </div>

      <div className="form-row" style={{ alignItems: "center" }}>
        <div>
          <label htmlFor="ss-logo">لوگوی فروشگاه</label>
          <input
            id="ss-logo"
            type="file"
            accept="image/*"
            onChange={handleLogoPick}
          />
        </div>
        {profile.logoDataUrl ? (
          <div>
            <label>پیش‌نمایش</label>
            <img src={profile.logoDataUrl} alt="لوگوی فروشگاه" style={{ height: 48, borderRadius: 6 }} />
          </div>
        ) : null}
      </div>

      <h3 style={{ marginTop: "var(--sv-space-6)" }}>رفتار پس از ثبت فروش</h3>
      <div className="form-row">
        <div>
          <label htmlFor="ss-auto-print">بعد از ثبت فروش</label>
          <select
            id="ss-auto-print"
            value={profile.autoPrintAfterSale ? "print" : "record-only"}
            onChange={(e) => update("autoPrintAfterSale", e.target.value === "print")}
          >
            <option value="record-only">فقط ثبت انجام شود</option>
            <option value="print">صفحهٔ چاپ فاکتور مستقیم باز شود</option>
          </select>
        </div>
      </div>

      <h3 style={{ marginTop: "var(--sv-space-6)" }}>تنظیمات محاسبات</h3>
      <p style={{ color: "var(--sv-text-600)", marginTop: 0 }}>
        این درصد به‌صورت پیش‌فرض در «ماشین‌حساب» پر می‌شود — خود ماشین‌حساب فقط محاسبه می‌کند، عدد پایه از
        همین‌جا می‌آید.
      </p>
      <div className="form-row">
        <div>
          <label htmlFor="ss-default-tax">درصد مالیات پیش‌فرض</label>
          <input
            id="ss-default-tax"
            type="number"
            min={0}
            value={profile.defaultTaxPercent}
            onChange={(e) => update("defaultTaxPercent", Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <h3 style={{ marginTop: "var(--sv-space-6)" }}>تنظیمات فروش اقساطی</h3>
      <div className="form-row">
        <div>
          <label htmlFor="ss-inst-fee">درصد کارمزد/سود اقساطی پیش‌فرض</label>
          <input
            id="ss-inst-fee"
            type="number"
            min={0}
            value={profile.installmentFeePercent}
            onChange={(e) => update("installmentFeePercent", Number(e.target.value) || 0)}
          />
        </div>
        <div>
          <label htmlFor="ss-inst-reminder">یادآوری پیامکی چند روز قبل از سررسید قسط</label>
          <input
            id="ss-inst-reminder"
            type="number"
            min={0}
            value={profile.installmentReminderDaysBefore}
            onChange={(e) => update("installmentReminderDaysBefore", Number(e.target.value) || 0)}
          />
        </div>
      </div>
      <p style={{ color: "var(--sv-text-600)", marginTop: 0 }}>
        موارد زیر در «پروندهٔ فروش اقساطی» چاپ می‌شوند (مشتری، شرح کالا و مبلغ کل همیشه چاپ می‌شوند):
      </p>
      <div className="form-row">
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={profile.installmentPrintFields.installmentCount}
            onChange={(e) =>
              update("installmentPrintFields", { ...profile.installmentPrintFields, installmentCount: e.target.checked })
            }
          />
          تعداد اقساط
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={profile.installmentPrintFields.monthlyAmount}
            onChange={(e) =>
              update("installmentPrintFields", { ...profile.installmentPrintFields, monthlyAmount: e.target.checked })
            }
          />
          مبلغ هر قسط
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={profile.installmentPrintFields.startDate}
            onChange={(e) =>
              update("installmentPrintFields", { ...profile.installmentPrintFields, startDate: e.target.checked })
            }
          />
          تاریخ شروع
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={profile.installmentPrintFields.status}
            onChange={(e) =>
              update("installmentPrintFields", { ...profile.installmentPrintFields, status: e.target.checked })
            }
          />
          وضعیت پرونده
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={profile.installmentPrintFields.guaranteeNote}
            onChange={(e) =>
              update("installmentPrintFields", { ...profile.installmentPrintFields, guaranteeNote: e.target.checked })
            }
          />
          یادداشت ضمانت
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={profile.installmentPrintFields.scheduleTable}
            onChange={(e) =>
              update("installmentPrintFields", { ...profile.installmentPrintFields, scheduleTable: e.target.checked })
            }
          />
          جدول کامل اقساط
        </label>
      </div>

      <h3 style={{ marginTop: "var(--sv-space-6)" }}>تنظیمات پرینتر</h3>
      <div className="form-row">
        <div>
          <label htmlFor="ss-printer">نام پرینتر</label>
          <input
            id="ss-printer"
            value={profile.printerName}
            onChange={(e) => update("printerName", e.target.value)}
            placeholder="مثلاً: پرینتر حرارتی فروشگاه"
          />
        </div>
        <div>
          <label htmlFor="ss-paper">سایز کاغذ</label>
          <select id="ss-paper" value={profile.paperSize} onChange={(e) => update("paperSize", e.target.value as PaperSize)}>
            {PAPER_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h3 style={{ marginTop: "var(--sv-space-6)" }}>تنظیمات بکاپ</h3>
      <div className="form-row">
        <div>
          <label htmlFor="ss-backup-enabled">بکاپ خودکار</label>
          <select
            id="ss-backup-enabled"
            value={profile.autoBackupEnabled ? "on" : "off"}
            onChange={(e) => update("autoBackupEnabled", e.target.value === "on")}
          >
            <option value="off">غیرفعال</option>
            <option value="on">فعال</option>
          </select>
        </div>
        <div>
          <label htmlFor="ss-backup-folder">مسیر پوشهٔ بکاپ</label>
          <input
            id="ss-backup-folder"
            value={profile.backupFolder}
            onChange={(e) => update("backupFolder", e.target.value)}
            placeholder="مثلاً: D:\\Starvent-Backup"
            disabled={!profile.autoBackupEnabled}
          />
        </div>
        <div>
          <label htmlFor="ss-backup-interval">بازهٔ بکاپ (ساعت)</label>
          <input
            id="ss-backup-interval"
            type="number"
            min={1}
            value={profile.backupIntervalHours}
            onChange={(e) => update("backupIntervalHours", Number(e.target.value) || 24)}
            disabled={!profile.autoBackupEnabled}
          />
        </div>
      </div>

      <h3 style={{ marginTop: "var(--sv-space-6)" }}>تنظیمات اینترنت</h3>
      <div className="form-row">
        <div>
          <label htmlFor="ss-offline">حالت آفلاین</label>
          <select
            id="ss-offline"
            value={profile.offlineModeEnabled ? "on" : "off"}
            onChange={(e) => update("offlineModeEnabled", e.target.value === "on")}
          >
            <option value="off">اتصال عادی به اینترنت</option>
            <option value="on">آفلاین (بدون اتصال به سایت قیمت لحظه‌ای)</option>
          </select>
        </div>
        <div>
          <label htmlFor="ss-proxy">آدرس Proxy (اختیاری)</label>
          <input
            id="ss-proxy"
            value={profile.proxyAddress}
            onChange={(e) => update("proxyAddress", e.target.value)}
            placeholder="مثلاً: 127.0.0.1:8080"
            disabled={profile.offlineModeEnabled}
          />
        </div>
      </div>

      <button type="button" className="btn-primary" onClick={handleSave} disabled={status === "loading"}>
        ذخیرهٔ تنظیمات فروشگاه
      </button>
      {status === "saved" ? <span style={{ marginInlineStart: 12, color: "var(--sv-success)" }}>ذخیره شد.</span> : null}
    </div>
  );
}
