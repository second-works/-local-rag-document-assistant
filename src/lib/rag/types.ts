export type SupportedDocumentType = "pdf" | "txt";

export type DocumentSummary = {
  documentId: string;
  name: string;
  size: number;
  pages: number;
  chunks: number;
  date: string;
  contentType: string;
  viewable: boolean;
};

export type DocumentPage = {
  page: number;
  text: string;
};

export type DocumentChunk = {
  chunkId: string;
  documentId: string;
  documentName: string;
  page: number;
  text: string;
};

export type Source = DocumentChunk & { score: number };

export type QueryResponse = {
  question?: string;
  answer: string;
  sources: Source[];
  grounded: boolean;
  mode: "local" | "fallback" | "error";
};
