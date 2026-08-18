import type { DocumentChunk, DocumentPage } from "./types";

const DEFAULT_CHUNK_SIZE = 700;
const DEFAULT_OVERLAP = 100;

export function chunkPages(
  pages: DocumentPage[],
  options: { chunkSize?: number; overlap?: number } = {},
): Omit<DocumentChunk, "documentId" | "documentName">[] {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = options.overlap ?? DEFAULT_OVERLAP;
  if (overlap >= chunkSize) throw new Error("overlap must be smaller than chunkSize");

  const chunks: Omit<DocumentChunk, "documentId" | "documentName">[] = [];
  for (const page of pages) {
    const normalized = page.text.replace(/\s+/g, " ").trim();
    if (!normalized) continue;
    let start = 0;
    let index = 0;
    while (start < normalized.length) {
      const end = Math.min(normalized.length, start + chunkSize);
      const text = normalized.slice(start, end).trim();
      if (text) chunks.push({ chunkId: `p${page.page}-c${index}`, page: page.page, text });
      if (end === normalized.length) break;
      start = end - overlap;
      index += 1;
    }
  }
  return chunks;
}
