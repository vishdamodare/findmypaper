"use server";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { forgotSchema, registerSchema, resetSchema } from "@/lib/validators";

type Result = { ok: true; devLink?: string } | { ok: false; error: string };
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export async function registerUser(input: unknown): Promise<Result> {
  const p = registerSchema.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0].message };
  const email = p.data.email.toLowerCase();
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) return { ok: false, error: "An account with this email already exists" };
  await db.user.create({ data: { name: p.data.name, email, passwordHash: await bcrypt.hash(p.data.password, 12) } });
  return { ok: true };
}

/**
 * Creates a single-use reset token (stored hashed, 1h expiry).
 * No mail transport is configured in this project, so in development the link is returned
 * for display and logged; in production nothing is revealed to the caller.
 */
export async function requestPasswordReset(input: unknown): Promise<Result> {
  const p = forgotSchema.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0].message };
  const user = await db.user.findUnique({ where: { email: p.data.email.toLowerCase() }, select: { id: true, passwordHash: true } });
  if (!user?.passwordHash) return { ok: true }; // do not reveal whether the account exists
  const token = randomBytes(32).toString("hex");
  await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await db.passwordResetToken.create({ data: { userId: user.id, tokenHash: sha(token), expiresAt: new Date(Date.now() + 3600_000) } });
  if (process.env.NODE_ENV === "production") {
    console.warn("[auth] Password reset requested but no mail transport is configured.");
    return { ok: true };
  }
  const devLink = `/reset-password?token=${token}`;
  console.log(`[auth] Password reset link (dev only): ${devLink}`);
  return { ok: true, devLink };
}

export async function resetPassword(input: unknown): Promise<Result> {
  const p = resetSchema.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0].message };
  const rec = await db.passwordResetToken.findUnique({ where: { tokenHash: sha(p.data.token) } });
  if (!rec || rec.expiresAt < new Date()) return { ok: false, error: "This reset link is invalid or has expired" };
  await db.$transaction([
    db.user.update({ where: { id: rec.userId }, data: { passwordHash: await bcrypt.hash(p.data.password, 12) } }),
    db.passwordResetToken.deleteMany({ where: { userId: rec.userId } }),
  ]);
  return { ok: true };
}
