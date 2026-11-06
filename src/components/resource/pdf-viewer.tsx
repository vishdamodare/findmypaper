"use client";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Download, Loader2, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export default function PdfViewer({ resourceId, fileName }: { resourceId: string; fileName: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(600);
  const [full, setFull] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, e.contentRect.width - 32)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const go = (n: number) => setPage(Math.min(Math.max(1, n), pages || 1));
  const toggleFull = () => (document.fullscreenElement ? document.exitFullscreen() : box.current?.requestFullscreen());

  return (
    <div ref={box} className="flex h-full min-h-0 flex-col bg-muted">
      <div className="flex flex-wrap items-center gap-1 border-b bg-background p-2">
        <Button variant="ghost" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => go(page - 1)}><ChevronLeft /></Button>
        <span className="flex items-center gap-1 text-sm">
          <input aria-label="Page number" className="h-8 w-12 rounded-md border bg-background px-1 text-center" value={page} onChange={(e) => go(Number(e.target.value) || 1)} /> / {pages || "–"}
        </span>
        <Button variant="ghost" size="icon" aria-label="Next page" disabled={page >= pages} onClick={() => go(page + 1)}><ChevronRight /></Button>
        <span className="mx-2 h-5 w-px bg-border" />
        <Button variant="ghost" size="icon" aria-label="Zoom out" disabled={zoom <= 0.5} onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}><ZoomOut /></Button>
        <span className="w-12 text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" aria-label="Zoom in" disabled={zoom >= 3} onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}><ZoomIn /></Button>
        <div className="ml-auto flex gap-1">
          <Button variant="ghost" size="icon" aria-label="Toggle fullscreen" onClick={toggleFull}>{full ? <Minimize2 /> : <Maximize2 />}</Button>
          <a href={`/api/resources/${resourceId}/download`} download={fileName} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Download className="size-4" /> Download</a>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {error ? (
          <p className="py-20 text-center text-sm text-muted-foreground">This file could not be previewed. Try downloading it instead.</p>
        ) : (
          <Document
            file={`/api/resources/${resourceId}/file`}
            onLoadSuccess={(d) => { setPages(d.numPages); setPage(1); }}
            onLoadError={() => setError(true)}
            loading={<div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>}
            className="flex justify-center"
          >
            <Page pageNumber={page} width={width * zoom} renderTextLayer={false} renderAnnotationLayer={false} className="overflow-hidden rounded-md shadow-md" />
          </Document>
        )}
      </div>
    </div>
  );
}
