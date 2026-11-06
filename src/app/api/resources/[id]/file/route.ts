import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFile, signedUrl } from "@/lib/storage";

/** Inline source for the PDF viewer (does not count as a download). */
export async function GET(_: NextRequest, ctx: RouteContext<"/api/resources/[id]/file">) {
  const { id } = await ctx.params;
  const r = await db.resource.findUnique({ where: { id }, select: { fileKey: true, mimeType: true, fileName: true } });
  if (!r) return NextResponse.json({ error: "File not found" }, { status: 404 });

  // Supabase: send the browser straight to the CDN; no bytes pass through this server.
  const url = await signedUrl(r.fileKey);
  if (url) return NextResponse.redirect(url, { status: 307, headers: { "Cache-Control": "private, max-age=240" } });

  const data = await getFile(r.fileKey);
  if (!data) return NextResponse.json({ error: "File not found" }, { status: 404 });
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": r.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(r.fileName)}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=300",
    },
  });
}
