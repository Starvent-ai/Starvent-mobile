import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { pluginRegistry } from "@/plugins/pluginRegistry";

const SUBTITLES: Record<string, string> = {
  dashboard: "نمای کلی فروش، موجودی و مشتریان",
  inventory: "افزودن و مدیریت کالاهای انبار",
  sales: "ثبت سریع فروش و مشاهدهٔ تاریخچه",
  customers: "مدیریت باشگاه مشتریان",
  repairs: "ثبت و پیگیری دستگاه‌های در حال تعمیر",
  suppliers: "مدیریت تأمین‌کنندگان و بدهی/بستانکاری",
  accounting: "صندوق، بانک، هزینه‌ها، درآمدها و چک‌ها",
  settings: "پیکربندی هوش مصنوعی و برنامه",
  "ai-suggestions-example": "نمونهٔ افزونهٔ مستقل"
};

export function App(): JSX.Element {
  const plugins = pluginRegistry.getAll();
  const [activeId, setActiveId] = useState<string>(plugins[0]?.id ?? "");

  const activePlugin = pluginRegistry.get(activeId) ?? plugins[0];

  if (!activePlugin) {
    return (
      <div className="empty-state">هیچ ماژولی ثبت نشده است. لطفاً pluginRegistry را بررسی کنید.</div>
    );
  }

  const ActiveComponent = activePlugin.component;

  return (
    <div className="app-shell">
      <div className="app-main">
        <TopBar title={activePlugin.label} subtitle={SUBTITLES[activePlugin.id]} />
        <div className="app-content">
          <ActiveComponent />
        </div>
      </div>
      <Sidebar activeId={activePlugin.id} onSelect={setActiveId} />
    </div>
  );
}
