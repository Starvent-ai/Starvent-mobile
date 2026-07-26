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
