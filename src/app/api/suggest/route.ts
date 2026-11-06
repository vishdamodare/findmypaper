import { NextRequest, NextResponse } from "next/server";
import { suggest } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ subjects: [], resources: [], universities: [] });
  return NextResponse.json(await suggest(q));
}
