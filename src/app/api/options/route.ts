import { NextRequest, NextResponse } from "next/server";
import { filterOptions } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const p = Object.fromEntries(req.nextUrl.searchParams);
  const data = await filterOptions(p.type ?? "", p);
  if (!data) return NextResponse.json({ error: "Unknown option type" }, { status: 400 });
  return NextResponse.json(data);
}
