"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { profileSchema } from "@/lib/validators";

export async function updateProfile(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Please log in again" };
  const p = profileSchema.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0].message };
  const d = p.data;
  // academic hierarchy must be internally consistent
  if (d.courseId && !(await db.course.findFirst({ where: { id: d.courseId, universityId: d.universityId }, select: { id: true } }))) return { ok: false, error: "Course does not belong to the selected university" };
  if (d.branchId && !(await db.branch.findFirst({ where: { id: d.branchId, courseId: d.courseId }, select: { id: true } }))) return { ok: false, error: "Branch does not belong to the selected course" };
  await db.user.update({
    where: { id: user.id },
    data: { name: d.name, universityId: d.universityId ?? null, courseId: d.courseId ?? null, branchId: d.branchId ?? null, academicYearId: d.academicYearId ?? null, semesterNo: d.semesterNo ?? null },
  });
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
