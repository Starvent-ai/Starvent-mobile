import { pluginRegistry } from "@/plugins/pluginRegistry";
import { PromptBuilder } from "./PromptBuilder";

pluginRegistry.register({
  id: "prompt-builder",
  label: "پرامپت‌ساز",
  icon: "✍",
  order: 14,
  component: PromptBuilder
});
