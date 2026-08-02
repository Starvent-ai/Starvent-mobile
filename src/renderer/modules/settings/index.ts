import { pluginRegistry } from "@/plugins/pluginRegistry";
import { Settings } from "./Settings";

pluginRegistry.register({
  id: "settings",
  label: "تنظیمات",
  icon: "⚙",
  order: 98,
  group: "سیستم",
  component: Settings
});
