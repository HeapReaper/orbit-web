"use server";

import { runAI } from "@/app/lib/ai";

const SYSTEM_PROMPT =
  "You are a helpful assistant that generates a single engaging question of the day for a Discord community. Reply with only the question — no explanation, no prefix, no quotes.";

export async function previewQotd(aiPrompt: string): Promise<{ question?: string; error?: string }> {
  if (!aiPrompt.trim()) {
    return { error: "Voer eerst een AI-prompt in." };
  }

  const result = await runAI(aiPrompt, SYSTEM_PROMPT);

  if (result.status === "error" || !result.data) {
    return { error: "AI kon geen vraag genereren. Controleer of de AI-service beschikbaar is." };
  }

  const question: string = result.data.response ?? "";
  return { question: question.trim() };
}