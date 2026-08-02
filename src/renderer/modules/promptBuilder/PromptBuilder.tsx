import { useState } from "react";
import { buildPromptText, usePromptBuilder } from "./usePromptBuilder";
import { formatDateForDisplay } from "@/lib/jalali";

const MODELS = ["OpenAI", "Claude", "Gemini", "Grok", "OpenRouter", "DeepSeek", "Mistral"] as const;

export function PromptBuilder(): JSX.Element {
  const { prompts, savePrompt, deletePrompt } = usePromptBuilder();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [targetModel, setTargetModel] = useState<(typeof MODELS)[number]>("Claude");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  const generatedText = buildPromptText(topic || "(بدون موضوع)", description, targetModel);

  function handleSave(): void {
    if (!topic.trim()) return;
    savePrompt({
      id: editingId ?? undefined,
      topic: topic.trim(),
      description: description.trim(),
      targetModel,
      generatedText
    });
    setEditingId(null);
    setTopic("");
    setDescription("");
  }

  function handleEdit(id: string): void {
    const prompt = prompts.find((p) => p.id === id);
    if (!prompt) return;
    setEditingId(prompt.id);
    setTopic(prompt.topic);
    setDescription(prompt.description);
    setTargetModel((prompt.targetModel as (typeof MODELS)[number]) ?? "Claude");
  }

  async function handleCopy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 1500);
    } catch {
      // Clipboard permission denied — nothing destructive to roll back.
    }
  }

  function handleExport(prompt: { topic: string; generatedText: string }): void {
    const blob = new Blob([prompt.generatedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${prompt.topic || "prompt"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{editingId ? "ویرایش پرامپت" : "ساخت پرامپت جدید"}</h3>
        <div className="form-row">
          <div>
            <label htmlFor="pb-topic">موضوع</label>
            <input id="pb-topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="مثلاً: تولید کپشن اینستاگرام" />
          </div>
          <div>
            <label htmlFor="pb-model">مدل هوش مصنوعی مقصد</label>
            <select id="pb-model" value={targetModel} onChange={(e) => setTargetModel(e.target.value as (typeof MODELS)[number])}>
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="pb-desc">توضیح</label>
            <input id="pb-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="زمینه و جزئیاتی که مدل باید بداند" />
          </div>
        </div>

        <h4>پیش‌نمایش پرامپت تولیدشده</h4>
        <pre className="prompt-preview">{generatedText}</pre>

        <div style={{ display: "flex", gap: "var(--sv-space-2)" }}>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={!topic.trim()}>
            {editingId ? "ذخیرهٔ تغییرات" : "ذخیره در کتابخانه"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => handleCopy(generatedText)}>
            {copyStatus === "copied" ? "کپی شد ✓" : "کپی"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => handleExport({ topic, generatedText })}>
            خروجی (.txt)
          </button>
          {editingId ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditingId(null);
                setTopic("");
                setDescription("");
              }}
            >
              انصراف از ویرایش
            </button>
          ) : null}
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>کتابخانهٔ پرامپت‌ها</h3>
        {prompts.length === 0 ? (
          <p className="empty-state">هنوز پرامپتی ذخیره نشده است.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>موضوع</th>
                <th>مدل</th>
                <th>تاریخ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((p) => (
                <tr key={p.id}>
                  <td>{p.topic}</td>
                  <td>{p.targetModel}</td>
                  <td>{formatDateForDisplay(p.createdAt)}</td>
                  <td style={{ display: "flex", gap: "var(--sv-space-2)" }}>
                    <button type="button" className="btn-secondary" onClick={() => handleEdit(p.id)}>
                      ویرایش
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => handleCopy(p.generatedText)}>
                      کپی
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => handleExport(p)}>
                      خروجی
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => deletePrompt(p.id)}>
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
