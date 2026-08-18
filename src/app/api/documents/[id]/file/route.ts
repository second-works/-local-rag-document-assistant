import { getDocumentFile } from "@/lib/documents/repository";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9][a-z0-9-]{2,80}$/i.test(id)) return Response.json({ error: "invalid document id" }, { status: 400 });

  const pageParam = new URL(request.url).searchParams.get("page");
  const page = pageParam === null ? undefined : Number(pageParam);
  if (page !== undefined && (!Number.isInteger(page) || page < 1 || page > 100)) return Response.json({ error: "invalid page" }, { status: 400 });

  const document = await getDocumentFile(id, page);
  if (!document) return Response.json({ error: "document file not found" }, { status: 404 });

  const headers = new Headers();
  if (document.httpMetadata) {
    if (document.httpMetadata.contentType) headers.set("content-type", document.httpMetadata.contentType);
    if (document.httpMetadata.contentDisposition) headers.set("content-disposition", document.httpMetadata.contentDisposition);
  }
  headers.set("content-disposition", `inline; filename*=UTF-8''${encodeURIComponent(document.summary.name)}`);
  headers.set("cache-control", "private, no-store");
  if (document.etag) headers.set("etag", document.etag);
  return new Response(document.body as unknown as BodyInit, { headers });
}
