import type { DocumentPage } from "./types";

export async function extractPages(fileName: string, buffer: ArrayBuffer): Promise<DocumentPage[]> {
  if (fileName.toLowerCase().endsWith(".txt")) {
    const text = new TextDecoder().decode(buffer);
    return [{ page: 1, text }];
  }
  if (!fileName.toLowerCase().endsWith(".pdf")) throw new Error("PDFまたはTXTのみ対応しています");

  const { default: parsePdf } = await import("pdf-parse");
  const parsed = await parsePdf(Buffer.from(buffer));
  return [{ page: 1, text: parsed.text }];
}
