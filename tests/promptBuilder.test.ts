import { describe, expect, it } from "vitest";
import { buildPromptText, promptBuilderActions } from "@/modules/promptBuilder/usePromptBuilder";

describe("promptBuilder", () => {
  it("includes the topic, description, and target model in the generated text", () => {
    const text = buildPromptText("تولید کپشن", "کپشن برای پست معرفی گوشی جدید", "Claude");
    expect(text).toContain("تولید کپشن");
    expect(text).toContain("کپشن برای پست معرفی گوشی جدید");
    expect(text).toContain("Claude");
  });

  it("saves a new prompt to the library", () => {
    const before = promptBuilderActions.getState().prompts.length;
    promptBuilderActions.savePrompt({
      topic: "موضوع تست",
      description: "توضیح تست",
      targetModel: "Claude",
      generatedText: buildPromptText("موضوع تست", "توضیح تست", "Claude")
    });
    expect(promptBuilderActions.getState().prompts.length).toBe(before + 1);
  });

  it("updates an existing prompt in place when an id is passed", () => {
    promptBuilderActions.savePrompt({
      topic: "قبل از ویرایش",
      description: "",
      targetModel: "Claude",
      generatedText: "متن اول"
    });
    const prompts = promptBuilderActions.getState().prompts;
    const created = prompts[prompts.length - 1];

    promptBuilderActions.savePrompt({
      id: created.id,
      topic: "بعد از ویرایش",
      description: "",
      targetModel: "Gemini",
      generatedText: "متن دوم"
    });

    const updated = promptBuilderActions.getState().prompts.find((p) => p.id === created.id);
    expect(updated?.topic).toBe("بعد از ویرایش");
    expect(updated?.targetModel).toBe("Gemini");
    expect(promptBuilderActions.getState().prompts.length).toBe(prompts.length);
  });

  it("removes a prompt from the library", () => {
    promptBuilderActions.savePrompt({
      topic: "حذف‌شدنی",
      description: "",
      targetModel: "Claude",
      generatedText: "متن"
    });
    const prompts = promptBuilderActions.getState().prompts;
    const created = prompts[prompts.length - 1];

    promptBuilderActions.deletePrompt(created.id);
    expect(promptBuilderActions.getState().prompts.find((p) => p.id === created.id)).toBeUndefined();
  });
});
