"use client";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PdfViewer } from "./pdf-viewer-lazy";

export function PreviewButton({ id, title, fileName, isPdf }: { id: string; title: string; fileName: string; isPdf: boolean }) {
  if (!isPdf)
    return <Button variant="outline" disabled title="Preview is available for PDF files only"><Eye /> Preview</Button>;
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}><Eye /> Preview</DialogTrigger>
      <DialogContent showCloseButton className="flex h-[88vh] w-full max-w-none flex-col gap-0 p-0 sm:max-w-4xl">
        <DialogTitle className="truncate border-b px-4 py-3 pr-12 text-sm font-medium">{title}</DialogTitle>
        <div className="min-h-0 flex-1"><PdfViewer resourceId={id} fileName={fileName} /></div>
      </DialogContent>
    </Dialog>
  );
}
