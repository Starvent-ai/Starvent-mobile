import { pluginRegistry } from "@/plugins/pluginRegistry";
import { Calculator } from "./Calculator";

pluginRegistry.register({
  id: "calculator",
  label: "ماشین‌حساب",
  icon: "🧮",
  order: 7,
  component: Calculator
});
