"use server";
import { revalidatePath } from "next/cache";
import { extname } from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deleteFile, putFile } from "@/lib/storage";
import { ALLOWED_FILES, MAX_FILE_BYTES, resourceMetaSchema, slugify } from "@/lib/validators";

type R = { ok: true; id?: string } | { ok: false; error: string };
const fail = (error: string): R => ({ ok: false, error });
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");

/** Runs a mutation, mapping common Prisma errors to readable messages. */
async function guard(fn: () => Promise<R>): Promise<R> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return fail("That already exists");
      if (e.code === "P2003" || e.code === "P2014") return fail("It is still in use – remove dependent items first");
      if (e.code === "P2025") return fail("Item not found");
    }
    console.error(e);
    return fail("Something went wrong");
  }
}

// ---------- Resources ----------
function sniffOk(ext: string, buf: Buffer) {
  if (ext === "pdf") return buf.subarray(0, 5).toString() === "%PDF-";
  if (ext === "docx" || ext === "pptx" || ext === "xlsx") return buf[0] === 0x50 && buf[1] === 0x4b;
  return !buf.subarray(0, 4096).includes(0); // txt: no binary bytes
}

export async function uploadResource(fd: FormData): Promise<R> {
  const user = await requireAdmin();
  const meta = resourceMetaSchema.safeParse(Object.fromEntries(["title", "description", "subjectId", "categoryId", "academicYearId"].map((k) => [k, str(fd, k)])));
  if (!meta.success) return fail(meta.error.issues[0].message);
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Choose a file to upload");
  if (file.size > MAX_FILE_BYTES) return fail(`File is larger than ${MAX_FILE_BYTES / 1024 / 1024} MB`);
  const ext = extname(file.name).slice(1).toLowerCase();
  const mimes = ALLOWED_FILES[ext];
  if (!mimes) return fail(`Unsupported file type. Allowed: ${Object.keys(ALLOWED_FILES).join(", ")}`);
  const buf = Buffer.from(await file.arrayBuffer());
  if (!sniffOk(ext, buf)) return fail(`File content does not look like a valid .${ext}`);

  const m = meta.data;
  const [subject, cat, year] = await Promise.all([
    db.subject.findUnique({ where: { id: m.subjectId }, select: { id: true } }),
    db.resourceCategory.findUnique({ where: { id: m.categoryId }, select: { id: true } }),
    db.academicYear.findUnique({ where: { id: m.academicYearId }, select: { id: true } }),
  ]);
  if (!subject || !cat || !year) return fail("Subject, type or academic year no longer exists");

  const fileKey = `${randomUUID()}.${ext}`;
  await putFile(fileKey, buf, mimes[0]);
  return guard(async () => {
    try {
      const r = await db.resource.create({
        data: { ...m, uploadedById: user.id, fileKey, fileName: file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 120), mimeType: mimes[0], fileSize: file.size },
        select: { id: true },
      });
      revalidatePath("/admin/resources");
      return { ok: true, id: r.id };
    } catch (e) {
      await deleteFile(fileKey); // don't orphan the file if the row failed
      throw e;
    }
  });
}

export async function updateResource(id: string, fd: FormData): Promise<R> {
  await requireAdmin();
  const meta = resourceMetaSchema.safeParse(Object.fromEntries(["title", "description", "subjectId", "categoryId", "academicYearId"].map((k) => [k, str(fd, k)])));
  if (!meta.success) return fail(meta.error.issues[0].message);
  return guard(async () => {
    await db.resource.update({ where: { id }, data: { ...meta.data, description: meta.data.description ?? null } });
    revalidatePath("/admin/resources");
    return { ok: true };
  });
}

export async function deleteResource(id: string): Promise<R> {
  await requireAdmin();
  return guard(async () => {
    const r = await db.resource.delete({ where: { id }, select: { fileKey: true } });
    await deleteFile(r.fileKey);
    revalidatePath("/admin/resources");
    return { ok: true };
  });
}

// ---------- Subjects ----------
const subjectSchema = z.object({
  code: z.string().trim().min(1, "Subject code is required").max(30),
  name: z.string().trim().min(2, "Subject name is required").max(120),
  branchId: z.string().min(1, "Choose a branch"),
  regulationId: z.string().min(1, "Choose a regulation"),
  semesterId: z.string().min(1, "Choose a semester"),
});

export async function createSubject(fd: FormData): Promise<R> {
  await requireAdmin();
  const p = subjectSchema.safeParse(Object.fromEntries(Object.keys(subjectSchema.shape).map((k) => [k, str(fd, k)])));
  if (!p.success) return fail(p.error.issues[0].message);
  return guard(async () => {
    const [branch, reg] = await Promise.all([
      db.branch.findUnique({ where: { id: p.data.branchId }, select: { course: { select: { universityId: true } } } }),
      db.regulation.findUnique({ where: { id: p.data.regulationId }, select: { universityId: true } }),
    ]);
    if (!branch || !reg) return fail("Branch or regulation not found");
    if (branch.course.universityId !== reg.universityId) return fail("Regulation belongs to a different university than the branch");
    await db.subject.create({ data: p.data });
    revalidatePath("/admin/subjects");
    return { ok: true };
  });
}

export async function deleteSubject(id: string): Promise<R> {
  await requireAdmin();
  return guard(async () => {
    const files = await db.resource.findMany({ where: { subjectId: id }, select: { fileKey: true } });
    await db.subject.delete({ where: { id } });
    await Promise.all(files.map((f) => deleteFile(f.fileKey)));
    revalidatePath("/admin/subjects");
    return { ok: true };
  });
}

// ---------- Master data ----------
const name = z.string().trim().min(1, "Name is required").max(120);
const pid = (m: string) => z.string().min(1, m);
type Master = { schema: z.ZodType<Record<string, unknown>>; create: (d: Record<string, unknown>) => Promise<unknown>; remove: (id: string) => Promise<unknown> };
/** Binds each schema to a create() typed from it, then erases to Master for the lookup table. */
function master<S extends z.ZodType>(schema: S, create: (d: z.infer<S>) => Promise<unknown>, remove: (id: string) => Promise<unknown>): Master {
  return { schema: schema as unknown as Master["schema"], create: create as unknown as Master["create"], remove };
}
const MASTERS = {
  university: master(z.object({ name, city: z.string().trim().max(80).optional() }),
    (d) => db.university.create({ data: { name: d.name, city: d.city || null, slug: slugify(d.name) } }), (id) => db.university.delete({ where: { id } })),
  course: master(z.object({ universityId: pid("Choose a university"), name }),
    (d) => db.course.create({ data: { ...d, slug: slugify(d.name) } }), (id) => db.course.delete({ where: { id } })),
  branch: master(z.object({ courseId: pid("Choose a course"), name, code: z.string().trim().min(1, "Code is required").max(20) }),
    (d) => db.branch.create({ data: d }), (id) => db.branch.delete({ where: { id } })),
  regulation: master(z.object({ universityId: pid("Choose a university"), name }),
    (d) => db.regulation.create({ data: d }), (id) => db.regulation.delete({ where: { id } })),
  academicYear: master(z.object({ startYear: z.coerce.number().int().min(2000).max(2100) }),
    (d) => db.academicYear.create({ data: { startYear: d.startYear, label: `${d.startYear}-${String(d.startYear + 1).slice(2)}` } }), (id) => db.academicYear.delete({ where: { id } })),
  semester: master(z.object({ number: z.coerce.number().int().min(1).max(12), studentYear: z.enum(["FE", "SE", "TE", "BE"]) }),
    (d) => db.semester.create({ data: d }), (id) => db.semester.delete({ where: { id } })),
  category: master(z.object({ name, description: z.string().trim().max(200).optional() }),
    (d) => db.resourceCategory.create({ data: { name: d.name, description: d.description || null, slug: slugify(d.name) } }), (id) => db.resourceCategory.delete({ where: { id } })),
} satisfies Record<string, Master>;
export type MasterKind = keyof typeof MASTERS;

export async function createMaster(kind: MasterKind, fd: FormData): Promise<R> {
  await requireAdmin();
  const m = MASTERS[kind];
  if (!m) return fail("Unknown type");
  const p = m.schema.safeParse(Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string")));
  if (!p.success) return fail(p.error.issues[0].message);
  return guard(async () => {
    await m.create(p.data);
    revalidatePath("/admin/academics");
    return { ok: true };
  });
}

export async function deleteMaster(kind: MasterKind, id: string): Promise<R> {
  await requireAdmin();
  const m = MASTERS[kind];
  if (!m) return fail("Unknown type");
  // cascading deletes remove resource rows, so remove their stored files too
  const subjectWhere = ({
    university: { branch: { course: { universityId: id } } }, course: { branch: { courseId: id } },
    branch: { branchId: id }, regulation: { regulationId: id },
  } as Record<string, object>)[kind];
  const files = subjectWhere ? await db.resource.findMany({ where: { subject: subjectWhere }, select: { fileKey: true } }) : [];
  return guard(async () => {
    await m.remove(id);
    await Promise.all(files.map((f) => deleteFile(f.fileKey)));
    revalidatePath("/admin/academics");
    return { ok: true };
  });
}
