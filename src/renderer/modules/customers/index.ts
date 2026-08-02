import { pluginRegistry } from "@/plugins/pluginRegistry";
import { Customers } from "./Customers";

pluginRegistry.register({
  id: "customers",
  label: "مشتریان",
  icon: "☺",
  order: 3,
  component: Customers
});
