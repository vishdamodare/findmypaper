import "server-only";
import type { Prisma, StudentYear } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export const PAGE_SIZE = 12;
export const SORTS = {
  latest: { label: "Latest uploads", orderBy: { createdAt: "desc" } },
  downloads: { label: "Most downloaded", orderBy: { downloadCount: "desc" } },
  az: { label: "A–Z", orderBy: { title: "asc" } },
  oldest: { label: "Oldest first", orderBy: { createdAt: "asc" } },
} as const satisfies Record<string, { label: string; orderBy: Prisma.ResourceOrderByWithRelationInput }>;
export type SortKey = keyof typeof SORTS;

export type ResourceFilters = {
  q?: string;
  universityId?: string;
  courseId?: string;
  branchId?: string;
  regulationId?: string;
  academicYearId?: string;
  studentYear?: string;
  semester?: string;
  subjectId?: string;
  categoryId?: string;
  category?: string; // category slug
  sort?: string;
  page?: string;
};

const STUDENT_YEARS = ["FE", "SE", "TE", "BE"];

export const resourceSelect = (userId?: string) =>
  ({
    id: true,
    title: true,
    description: true,
    fileName: true,
    mimeType: true,
    fileSize: true,
    downloadCount: true,
    createdAt: true,
    isDemo: true,
    category: { select: { name: true, slug: true } },
    academicYear: { select: { label: true } },
    subject: {
      select: {
        id: true,
        name: true,
        code: true,
        semester: { select: { number: true, studentYear: true } },
        regulation: { select: { name: true } },
        branch: { select: { name: true, code: true, course: { select: { name: true, university: { select: { name: true } } } } } },
      },
    },
    bookmarks: userId ? { where: { userId }, select: { userId: true } } : false,
  }) satisfies Prisma.ResourceSelect;

export type ResourceItem = Prisma.ResourceGetPayload<{ select: ReturnType<typeof resourceSelect> }>;

export function buildWhere(f: ResourceFilters): Prisma.ResourceWhereInput {
  const subject: Prisma.SubjectWhereInput = {};
  if (f.branchId) subject.branchId = f.branchId;
  if (f.regulationId) subject.regulationId = f.regulationId;
  if (f.courseId || f.universityId)
    subject.branch = {
      ...(f.courseId && { courseId: f.courseId }),
      ...(f.universityId && { course: { universityId: f.universityId } }),
    };
  const sem: Prisma.SemesterWhereInput = {};
  if (f.semester && /^[1-8]$/.test(f.semester)) sem.number = Number(f.semester);
  if (f.studentYear && STUDENT_YEARS.includes(f.studentYear)) sem.studentYear = f.studentYear as StudentYear;
  if (Object.keys(sem).length) subject.semester = sem;

  const and: Prisma.ResourceWhereInput[] = [];
  if (Object.keys(subject).length) and.push({ subject });
  if (f.subjectId) and.push({ subjectId: f.subjectId });
  if (f.categoryId) and.push({ categoryId: f.categoryId });
  if (f.category) and.push({ category: { slug: f.category } });
  if (f.academicYearId) and.push({ academicYearId: f.academicYearId });

  // Free text: every word must match at least one searchable field.
  for (const term of (f.q ?? "").split(/\s+/).filter(Boolean).slice(0, 8)) {
    const c = { contains: term, mode: "insensitive" as const };
    and.push({
      OR: [
        { title: c },
        { description: c },
        { category: { name: c } },
        { academicYear: { label: c } },
        { subject: { OR: [{ name: c }, { code: c }, { branch: { name: c } }, { branch: { code: c } }, { branch: { course: { university: { name: c } } } }, { regulation: { name: c } }] } },
      ],
    });
  }
  return and.length ? { AND: and } : {};
}

export async function searchResources(f: ResourceFilters, userId?: string) {
  const where = buildWhere(f);
  const sort = (f.sort && f.sort in SORTS ? f.sort : "latest") as SortKey;
  const page = Math.max(1, parseInt(f.page ?? "1", 10) || 1);
  const [total, items] = await Promise.all([
    db.resource.count({ where }),
    db.resource.findMany({
      where,
      select: resourceSelect(userId),
      orderBy: [SORTS[sort].orderBy, { id: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  return { items, total, page, sort, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function homeSections(userId?: string) {
  const take = 4;
  const [latest, popular, subjects, stats] = await Promise.all([
    db.resource.findMany({ select: resourceSelect(userId), orderBy: { createdAt: "desc" }, take }),
    db.resource.findMany({ select: resourceSelect(userId), orderBy: { downloadCount: "desc" }, take }),
    db.subject.findMany({
      select: { id: true, name: true, code: true, semester: { select: { number: true } }, branch: { select: { code: true } }, _count: { select: { resources: true } } },
      orderBy: { resources: { _count: "desc" } },
      take: 8,
    }),
    Promise.all([db.resource.count(), db.subject.count(), db.university.count()]),
  ]);
  return { latest, popular, subjects, stats: { resources: stats[0], subjects: stats[1], universities: stats[2] } };
}

export async function suggest(q: string) {
  const c = { contains: q, mode: "insensitive" as const };
  const [subjects, resources, universities] = await Promise.all([
    db.subject.findMany({ where: { OR: [{ name: c }, { code: c }] }, select: { id: true, name: true, code: true }, take: 4 }),
    db.resource.findMany({ where: { title: c }, select: { id: true, title: true }, orderBy: { downloadCount: "desc" }, take: 4 }),
    db.university.findMany({ where: { name: c }, select: { id: true, name: true }, take: 2 }),
  ]);
  return { subjects, resources, universities };
}

/** Cascading filter options. Each type only returns rows valid for its parents. */
export async function filterOptions(type: string, p: Record<string, string | undefined>) {
  switch (type) {
    case "universities":
      return db.university.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
    case "courses":
      return p.universityId ? db.course.findMany({ where: { universityId: p.universityId }, select: { id: true, name: true }, orderBy: { name: "asc" } }) : [];
    case "branches":
      return p.courseId ? db.branch.findMany({ where: { courseId: p.courseId }, select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }) : [];
    case "regulations":
      return p.universityId ? db.regulation.findMany({ where: { universityId: p.universityId }, select: { id: true, name: true }, orderBy: { name: "asc" } }) : [];
    case "academicYears":
      return db.academicYear.findMany({ select: { id: true, label: true }, orderBy: { startYear: "desc" } });
    case "semesters":
      return db.semester.findMany({
        where: p.studentYear && STUDENT_YEARS.includes(p.studentYear) ? { studentYear: p.studentYear as StudentYear } : {},
        select: { number: true, studentYear: true },
        orderBy: { number: "asc" },
      });
    case "categories":
      return db.resourceCategory.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } });
    case "subjects": {
      if (!p.branchId) return [];
      const sem: Prisma.SemesterWhereInput = {};
      if (p.semester && /^[1-8]$/.test(p.semester)) sem.number = Number(p.semester);
      if (p.studentYear && STUDENT_YEARS.includes(p.studentYear)) sem.studentYear = p.studentYear as StudentYear;
      return db.subject.findMany({
        where: { branchId: p.branchId, ...(p.regulationId && { regulationId: p.regulationId }), ...(Object.keys(sem).length && { semester: sem }) },
        select: { id: true, name: true, code: true },
        orderBy: [{ semester: { number: "asc" } }, { name: "asc" }],
      });
    }
    default:
      return null;
  }
}

export function fileFormat(fileName: string) {
  return (fileName.split(".").pop() ?? "file").toUpperCase();
}
export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
}
