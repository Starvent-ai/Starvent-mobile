export interface AppInfo {
  version: string;
  platform: NodeJS.Platform;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  lowStockThreshold: number;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  loyaltyTier: "عادی" | "نقره‌ای" | "طلایی" | "ویژه";
  totalPurchases: number;
}

export interface SaleRecord {
  id: string;
  itemId: string;
  itemName: string;
  customerId: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
}

export interface MobilePriceSourceConfig {
  url: string;
  itemSelector: string;
  nameSelector: string;
  priceSelector: string;
  refreshMinutes: number;
}

export interface MobilePriceItem {
  name: string;
  price: number;
}

export interface MobilePriceListResult {
  items: MobilePriceItem[];
  updatedAt: string | null;
  error: string | null;
}

export type RepairStatus =
  | "دریافت شده"
  | "در حال تعمیر"
  | "منتظر قطعه"
  | "تکمیل شده"
  | "تحویل داده شده";

export type RepairPriority = "عادی" | "فوری" | "بحرانی";

export const REPAIR_STATUSES: RepairStatus[] = [
  "دریافت شده",
  "در حال تعمیر",
  "منتظر قطعه",
  "تکمیل شده",
  "تحویل داده شده"
];

export const REPAIR_PRIORITIES: RepairPriority[] = ["عادی", "فوری", "بحرانی"];

export interface RepairTicket {
  id: string;
  deviceModel: string;
  imei: string;
  serialNumber: string;
  /** Device unlock password/pattern — shown once here for the technician's
   *  reference; kept out of any printed receipt or log output. */
  devicePassword: string;
  faultDescription: string;
  accessoriesReceived: string;
  partsUsed: string;
  laborFee: number;
  status: RepairStatus;
  priority: RepairPriority;
  technician: string;
  customerId: string | null;
  customerName: string;
  /** ISO date string (yyyy-mm-dd), estimated delivery date. */
  deliveryDate: string;
  /** PNG data URL captured from the signature pad, or null until signed. */
  customerSignature: string | null;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  contractNotes: string;
  /** Positive: shop owes the supplier. Negative: supplier owes the shop. */
  balance: number;
  rating: number;
  createdAt: string;
}

export interface SupplierPurchase {
  id: string;
  supplierId: string;
  itemDescription: string;
  amount: number;
  date: string;
  paid: boolean;
}

export type AccountingCategory = "فروش" | "خرید کالا" | "اجاره" | "حقوق" | "قبوض" | "سایر";

export interface CashTransaction {
  id: string;
  type: "درآمد" | "هزینه";
  account: "صندوق" | "بانک";
  category: AccountingCategory;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface CheckRecord {
  id: string;
  direction: "دریافتنی" | "پرداختنی";
  payerOrPayee: string;
  amount: number;
  dueDate: string;
  status: "در جریان" | "وصول شده" | "برگشتی";
  createdAt: string;
}
