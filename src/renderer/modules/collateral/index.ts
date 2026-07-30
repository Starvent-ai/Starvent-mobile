import { pluginRegistry } from "@/plugins/pluginRegistry";
import { Collateral } from "./Collateral";

pluginRegistry.register({
  id: "collateral",
  label: "مدیریت ضمانت",
  icon: "🛡",
  order: 11,
  component: Collateral
});
