import { pluginRegistry } from "@/plugins/pluginRegistry";
import { Accounting } from "./Accounting";

pluginRegistry.register({
  id: "accounting",
  label: "حسابداری",
  icon: "💰",
  order: 6,
  component: Accounting
});
