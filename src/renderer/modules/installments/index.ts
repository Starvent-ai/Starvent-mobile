import { pluginRegistry } from "@/plugins/pluginRegistry";
import { InstallmentSales } from "./InstallmentSales";

pluginRegistry.register({
  id: "installments",
  label: "فروش اقساطی",
  icon: "🗓",
  order: 10,
  component: InstallmentSales
});
