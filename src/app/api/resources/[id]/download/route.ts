import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getFile, signedUrl } from "@/lib/storage";

export async function GET(_: NextRequest, ctx: RouteContext<"/api/resources/[id]/download">) {
  const { id } = await ctx.params;
  const r = await db.resource.findUnique({ where: { id }, select: { fileKey: true, mimeType: true, fileName: true } });
  if (!r) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const url = await signedUrl(r.fileKey, { downloadAs: r.fileName });
  const data = url ? null : await getFile(r.fileKey);
  if (!url && !data) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const userId = (await auth())?.user?.id;
  await db.$transaction([
    db.resource.update({ where: { id }, data: { downloadCount: { increment: 1 } } }),
    db.download.create({ data: { resourceId: id, userId: userId || null } }),
  ]);

  // Count is recorded here, but the bytes come straight from Supabase's CDN.
  if (url) return NextResponse.redirect(url, { status: 307, headers: { "Cache-Control": "no-store" } });
  return new NextResponse(new Uint8Array(data!), {
    headers: {
      "Content-Type": r.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(r.fileName)}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
