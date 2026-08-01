import { pluginRegistry } from "@/plugins/pluginRegistry";
import { LivePrices } from "./LivePrices";

pluginRegistry.register({
  id: "live-prices",
  label: "قیمت لحظه‌ای",
  icon: "📶",
  order: 5,
  component: LivePrices
});
