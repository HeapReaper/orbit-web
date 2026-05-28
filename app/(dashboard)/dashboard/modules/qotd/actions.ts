"use server";

import { runAI } from "@/app/lib/ai";

const SYSTEM_PROMPT =
  "Reply with only the question — no explanation, no prefix, no quotes.";

export async function previewQotd(aiPrompt: string): Promise<{ question?: string; error?: string }> {
  if (!aiPrompt.trim()) {
    return { error: "Fill in a prompt first" };
  }

  const result = await runAI(aiPrompt, SYSTEM_PROMPT);

  if (result.status === "error" || !result.data) {
    return { error: "AI couldn't generate a question. Try again later" };
  }

  const question: string = result.data.response ?? "";
  return { question: question.trim() };
}
