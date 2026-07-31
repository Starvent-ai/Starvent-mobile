import type { DashboardStat } from "@shared/types";
import { useInventory } from "@/modules/inventory/useInventory";
import { useSales } from "@/modules/sales/useSales";
import { useCustomers } from "@/modules/customers/useCustomers";
import { formatDateForDisplay } from "@/lib/jalali";

function buildStats(
  todaySalesTotal: number,
  lowStockCount: number,
  customerCount: number,
  itemCount: number
): DashboardStat[] {
  return [
    {
      id: "sales-today",
      label: "فروش امروز",
      value: `${todaySalesTotal.toLocaleString("fa-IR")} تومان`,
      trend: todaySalesTotal > 0 ? "up" : "flat",
      trendLabel: todaySalesTotal > 0 ? "ثبت‌شده" : "بدون فروش ثبت‌شده"
    },
    {
      id: "low-stock",
      label: "هشدار کمبود موجودی",
      value: String(lowStockCount),
      trend: lowStockCount > 0 ? "down" : "flat",
      trendLabel: lowStockCount > 0 ? "نیاز به بررسی" : "موجودی سالم"
    },
    {
      id: "customers",
      label: "تعداد مشتریان",
      value: String(customerCount),
      trend: "flat"
    },
    {
      id: "items",
      label: "اقلام ثبت‌شده در انبار",
      value: String(itemCount),
      trend: "flat"
    }
  ];
}

export function Dashboard(): JSX.Element {
  const { items } = useInventory();
  const { sales } = useSales();
  const { customers } = useCustomers();

  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySalesTotal = sales
    .filter((s) => s.createdAt.slice(0, 10) === todayKey)
    .reduce((sum, s) => sum + s.total, 0);
  const lowStockCount = items.filter((i) => i.quantity <= i.lowStockThreshold).length;

  const stats = buildStats(todaySalesTotal, lowStockCount, customers.length, items.length);

  return (
    <div>
      <div className="stat-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.id}>
            <span className="stat-card__label">{stat.label}</span>
            <span className="stat-card__value">{stat.value}</span>
            {stat.trendLabel ? (
              <span className="stat-card__trend" data-trend={stat.trend}>
                {stat.trendLabel}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>آخرین فروش‌های ثبت‌شده</h3>
        {sales.length === 0 ? (
          <p className="empty-state">هنوز فروشی ثبت نشده. از بخش «فروش» یک تراکنش ثبت کنید.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>کالا</th>
                <th>تعداد</th>
                <th>مبلغ کل</th>
                <th>تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {sales
                .slice()
                .reverse()
                .slice(0, 6)
                .map((s) => (
                  <tr key={s.id}>
                    <td>{s.itemName}</td>
                    <td>{s.quantity}</td>
                    <td>{s.total.toLocaleString("fa-IR")} تومان</td>
                    <td>{formatDateForDisplay(s.createdAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
