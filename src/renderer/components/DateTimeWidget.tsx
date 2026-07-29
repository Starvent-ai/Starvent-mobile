import { useEffect, useState } from "react";
import {
  GREGORIAN_MONTH_NAMES_FA,
  JALALI_MONTH_NAMES,
  formatGregorian,
  getJalaliDateTime,
  gregorianToJalali,
  jalaliToGregorian,
  toPersianDigits
} from "@/lib/jalali";

/**
 * Lives in the top bar, opposite the page title. Two jobs:
 *  1. A live Jalali date + clock, always visible (no click needed).
 *  2. A tiny converter popover — type either a Jalali or a Gregorian date
 *     and see the other calendar's equivalent immediately, Gregorian month
 *     shown both as a number and by name as requested.
 * Pure client-side math (@/lib/jalali) — no network, no extra dependency.
 */
export function DateTimeWidget(): JSX.Element {
  const [now, setNow] = useState(() => new Date());
  const [converterOpen, setConverterOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const jalaliNow = getJalaliDateTime(now);

  return (
    <div className="date-widget">
      <button
        type="button"
        className="date-widget__clock"
        onClick={() => setConverterOpen((open) => !open)}
        title="تبدیل تاریخ شمسی و میلادی"
      >
        <span className="date-widget__date">{jalaliNow.formattedDate}</span>
        <span className="date-widget__time">{jalaliNow.formattedTime}</span>
      </button>

      {converterOpen ? <DateConverterPopover onClose={() => setConverterOpen(false)} /> : null}
    </div>
  );
}

function DateConverterPopover({ onClose }: { onClose: () => void }): JSX.Element {
  const today = new Date();
  const [jy, setJy] = useState(String(gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate())[0]));
  const [jm, setJm] = useState(String(gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate())[1]));
  const [jd, setJd] = useState(String(gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate())[2]));

  const [gy, setGy] = useState(String(today.getFullYear()));
  const [gm, setGm] = useState(String(today.getMonth() + 1));
  const [gd, setGd] = useState(String(today.getDate()));

  let jalaliToGregorianResult: string | null = null;
  try {
    const [ry, rm, rd] = jalaliToGregorian(Number(jy), Number(jm), Number(jd));
    jalaliToGregorianResult = formatGregorian(ry, rm, rd);
  } catch {
    jalaliToGregorianResult = null;
  }

  let gregorianToJalaliResult: string | null = null;
  try {
    const [ry, rm, rd] = gregorianToJalali(Number(gy), Number(gm), Number(gd));
    gregorianToJalaliResult = toPersianDigits(`${rd} ${JALALI_MONTH_NAMES[rm - 1]} ${ry}`);
  } catch {
    gregorianToJalaliResult = null;
  }

  return (
    <div className="date-widget__popover card">
      <div className="date-widget__popover-header">
        <h4>مبدل تاریخ شمسی ⇄ میلادی</h4>
        <button type="button" className="date-widget__close" onClick={onClose} aria-label="بستن">
          ✕
        </button>
      </div>

      <div className="date-widget__converter-row">
        <span className="date-widget__converter-label">شمسی به میلادی</span>
        <div className="date-widget__inputs">
          <input aria-label="روز شمسی" type="number" min={1} max={31} value={jd} onChange={(e) => setJd(e.target.value)} />
          <input aria-label="ماه شمسی" type="number" min={1} max={12} value={jm} onChange={(e) => setJm(e.target.value)} />
          <input aria-label="سال شمسی" type="number" value={jy} onChange={(e) => setJy(e.target.value)} />
        </div>
        <div className="date-widget__result">
          {jalaliToGregorianResult ?? "تاریخ نامعتبر است"}
        </div>
      </div>

      <div className="date-widget__converter-row">
        <span className="date-widget__converter-label">میلادی به شمسی</span>
        <div className="date-widget__inputs">
          <input aria-label="روز میلادی" type="number" min={1} max={31} value={gd} onChange={(e) => setGd(e.target.value)} />
          <select aria-label="ماه میلادی" value={gm} onChange={(e) => setGm(e.target.value)}>
            {GREGORIAN_MONTH_NAMES_FA.map((label, index) => (
              <option key={label} value={index + 1}>
                {index + 1} — {label}
              </option>
            ))}
          </select>
          <input aria-label="سال میلادی" type="number" value={gy} onChange={(e) => setGy(e.target.value)} />
        </div>
        <div className="date-widget__result">
          {gregorianToJalaliResult ?? "تاریخ نامعتبر است"}
        </div>
      </div>
    </div>
  );
}
