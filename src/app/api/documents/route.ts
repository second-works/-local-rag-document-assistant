import { NextResponse } from "next/server";
import { listDocuments } from "@/lib/documents/repository";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ documents: await listDocuments() }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "document list failed" }, { status: 500 });
  }
}
