import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildWhere } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const total = await db.resource.count({ where: buildWhere(Object.fromEntries(req.nextUrl.searchParams)) });
  return NextResponse.json({ total });
}
