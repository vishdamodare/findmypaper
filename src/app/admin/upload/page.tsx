import type { Metadata } from "next";
import { UploadForm } from "@/components/admin/upload-form";

export const metadata: Metadata = { title: "Upload resource" };

export default function UploadPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Upload a resource</h1>
      <p className="mt-1 mb-6 text-muted-foreground">Pick the exact subject so students only see it for the right university, branch and semester.</p>
      <div className="rounded-2xl border bg-card p-6"><UploadForm /></div>
    </div>
  );
}
