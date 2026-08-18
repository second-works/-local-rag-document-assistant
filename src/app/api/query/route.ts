import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/rag/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { question?: unknown };
    if (typeof body.question !== "string" || body.question.trim().length === 0) return NextResponse.json({ error: "question is required" }, { status: 400 });
    return NextResponse.json(await answerQuestion(body.question.trim()));
  } catch {
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }
}
