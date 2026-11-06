/**
 * Production-safe first-run setup: base lookup data + one admin account. No demo content.
 * Idempotent. Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='long-random-password' npm run bootstrap
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { slugify } from "@/lib/validators";

const CATEGORIES = [
  ["Notes", "Chapter-wise class and self-study notes"],
  ["Previous Year Question Papers (PYQs)", "Past exam papers"],
  ["Syllabus", "Module and credit breakdown"],
  ["Question Bank", "Practice questions grouped by module"],
  ["Assignments", "Assignment sheets and solutions"],
  ["Practical Files", "Completed experiment write-ups"],
  ["Lab Manuals", "Lab procedures and viva questions"],
  ["Reference Materials", "Reference books and further reading"],
  ["Study Materials", "Formula sheets and summaries"],
] as const;
const slug = (n: string) => (n.startsWith("Previous") ? "pyq" : slugify(n));

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");

  for (let n = 1; n <= 8; n++)
    await db.semester.upsert({ where: { number: n }, update: {}, create: { number: n, studentYear: (["FE", "SE", "TE", "BE"] as const)[Math.ceil(n / 2) - 1] } });
  for (const [name, description] of CATEGORIES)
    await db.resourceCategory.upsert({ where: { slug: slug(name) }, update: {}, create: { name, slug: slug(name), description } });
  const y = new Date().getFullYear();
  for (const s of [y - 1, y, y + 1])
    await db.academicYear.upsert({ where: { label: `${s}-${String(s + 1).slice(2)}` }, update: {}, create: { label: `${s}-${String(s + 1).slice(2)}`, startYear: s } });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.upsert({ where: { email }, update: { passwordHash }, create: { email, name: "Admin", passwordHash } });
  await db.admin.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, level: "SUPER" } });
  console.log(`Bootstrapped. Admin: ${email}`);
}

main().finally(() => db.$disconnect());
