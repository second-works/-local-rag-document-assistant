import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Local RAG Document Assistant",
  description: "Gemma 4 local RAG document search assistant",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
