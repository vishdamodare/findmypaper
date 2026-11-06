import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getSessionUser() {
  const s = await auth();
  return s?.user?.id ? s.user : null;
}

export async function requireUser(next = "/") {
  const u = await getSessionUser();
  if (!u) redirect(`/login?next=${encodeURIComponent(next)}`);
  return u;
}

/** Re-checks the Admin table (not just the JWT) so revoked admins lose access immediately. */
export async function isAdminUser(userId: string) {
  return !!(await db.admin.findUnique({ where: { userId }, select: { id: true } }));
}

export async function requireAdmin() {
  const u = await getSessionUser();
  if (!u) redirect("/login?next=/admin");
  if (!(await isAdminUser(u.id))) redirect("/");
  return u;
}
