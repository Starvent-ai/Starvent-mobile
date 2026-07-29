import { pluginRegistry } from "@/plugins/pluginRegistry";
import { Suppliers } from "./Suppliers";

pluginRegistry.register({
  id: "suppliers",
  label: "تأمین‌کنندگان",
  icon: "🚚",
  order: 5,
  component: Suppliers
});
