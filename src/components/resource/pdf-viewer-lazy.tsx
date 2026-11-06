"use client";
import dynamic from "next/dynamic";

export const PdfViewer = dynamic(() => import("./pdf-viewer"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-muted-foreground">Loading viewer…</div>,
});
