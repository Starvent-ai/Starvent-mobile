import { pluginRegistry } from "@/plugins/pluginRegistry";
import { Settings } from "./Settings";

pluginRegistry.register({
  id: "settings",
  label: "تنظیمات",
  icon: "⚙",
  order: 99,
  component: Settings
});
