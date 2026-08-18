import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true, service: "local-rag-document-assistant", llm: process.env.LOCAL_LLM_MODEL ?? "not-configured", vectorSearch: process.env.VECTOR_SEARCH_ENABLED === "1" });
}
