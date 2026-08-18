import { generateWithLocalLlm } from "@/lib/llm/openai-compatible";
import { searchChunks } from "./store";
import type { QueryResponse } from "./types";

const NO_ANSWER = "登録された文書からは確認できません。";

export async function answerQuestion(question: string): Promise<QueryResponse> {
  const sources = searchChunks(question, 5);
  if (sources.length === 0) return { question, answer: NO_ANSWER, sources: [], grounded: false, mode: "fallback" };

  try {
    const localAnswer = await generateWithLocalLlm(question, sources);
    if (localAnswer) return { question, answer: localAnswer, sources, grounded: true, mode: "local" };
  } catch (error) {
    console.warn("Local LLM unavailable; using grounded fallback", error);
  }

  return { question, answer: `${sources[0].text}`, sources, grounded: true, mode: "fallback" };
}
