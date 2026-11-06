"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

/** Returns the new saved state, or null when the user is not signed in. */
export async function toggleBookmark(resourceId: string): Promise<boolean | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const key = { userId_resourceId: { userId: user.id, resourceId } };
  const existing = await db.bookmark.findUnique({ where: key });
  if (existing) await db.bookmark.delete({ where: key });
  else await db.bookmark.create({ data: { userId: user.id, resourceId } });
  revalidatePath("/saved");
  return !existing;
}
