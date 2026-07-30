import { createStore } from "@/state/createStore";
import type { SavedPrompt } from "@shared/types";

interface PromptBuilderState {
  prompts: SavedPrompt[];
}

const promptBuilderStore = createStore<PromptBuilderState>({ prompts: [] });

/**
 * Pure local text template — does not call any AI provider or network
 * endpoint. It only assembles a ready-to-paste prompt for whichever tool
 * the person uses (matches the project's "don't touch the AI/API area"
 * instruction: this module produces text, it never sends it anywhere).
 */
export function buildPromptText(topic: string, description: string, targetModel: string): string {
  return [
    "# نقش",
    `شما یک دستیار متخصص در حوزهٔ «${topic}» هستید.`,
    "",
    "# زمینه و هدف",
    description || "(توضیحی وارد نشده است)",
    "",
    "# دستور",
    "با توجه به زمینهٔ بالا، پاسخ را دقیق، ساختاریافته و کاربردی ارائه بده. در صورت نیاز، مراحل را",
    "به‌صورت گام‌به‌گام بنویس و فرض‌های خودت را صریح بیان کن.",
    "",
    "# قالب خروجی",
    "پاسخ را به زبان فارسی و با فرمت خوانا (تیتر و لیست جایی که لازم است) بنویس.",
    "",
    `(این پرامپت برای استفاده در ${targetModel} آماده شده است.)`
  ].join("\n");
}

interface SavePromptInput {
  id?: string;
  topic: string;
  description: string;
  targetModel: string;
  generatedText: string;
}

function savePrompt(input: SavePromptInput): void {
  if (input.id) {
    promptBuilderStore.setState((prev) => ({
      prompts: prev.prompts.map((p) =>
        p.id === input.id
          ? { ...p, topic: input.topic, description: input.description, targetModel: input.targetModel, generatedText: input.generatedText }
          : p
      )
    }));
    return;
  }
  const prompt: SavedPrompt = {
    id: `prm-${Date.now()}`,
    topic: input.topic,
    description: input.description,
    targetModel: input.targetModel,
    generatedText: input.generatedText,
    createdAt: new Date().toISOString()
  };
  promptBuilderStore.setState((prev) => ({ prompts: [...prev.prompts, prompt] }));
}

function deletePrompt(id: string): void {
  promptBuilderStore.setState((prev) => ({ prompts: prev.prompts.filter((p) => p.id !== id) }));
}

export function usePromptBuilder() {
  const state = promptBuilderStore.useStore();
  return { prompts: state.prompts, savePrompt, deletePrompt };
}

export const promptBuilderActions = {
  savePrompt,
  deletePrompt,
  getState: promptBuilderStore.getState
};
