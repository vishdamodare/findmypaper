"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FilterSelect } from "@/components/finder/filter-select";
import { useOptions } from "@/components/finder/use-options";
import { uploadResource } from "@/lib/actions/admin";
import { ALLOWED_FILES, MAX_FILE_BYTES } from "@/lib/validators";
import { AdminForm } from "./admin-form";
import { inputCls } from "./ui";

const EXTS = Object.keys(ALLOWED_FILES);
type N = { id: string; name: string };

export function UploadForm() {
  const router = useRouter();
  const [s, setS] = useState({ universityId: "", courseId: "", branchId: "", regulationId: "", studentYear: "", semester: "", subjectId: "" });
  const set = (k: keyof typeof s, v: string) =>
    setS((c) => ({ ...c, [k]: v, ...(k === "universityId" ? { courseId: "", branchId: "", regulationId: "", subjectId: "" } : {}), ...(k === "courseId" ? { branchId: "", subjectId: "" } : {}), ...(["branchId", "regulationId", "studentYear", "semester"].includes(k) ? { subjectId: "" } : {}), ...(k === "studentYear" ? { semester: "" } : {}) }));

  const unis = useOptions<N>("universities", {});
  const courses = useOptions<N>("courses", { universityId: s.universityId }, !!s.universityId);
  const branches = useOptions<N & { code: string }>("branches", { courseId: s.courseId }, !!s.courseId);
  const regs = useOptions<N>("regulations", { universityId: s.universityId }, !!s.universityId);
  const sems = useOptions<{ number: number }>("semesters", { studentYear: s.studentYear });
  const subjects = useOptions<N & { code: string }>("subjects", { branchId: s.branchId, regulationId: s.regulationId, studentYear: s.studentYear, semester: s.semester }, !!s.branchId);
  const years = useOptions<{ id: string; label: string }>("academicYears", {});
  const cats = useOptions<N>("categories", {});

  return (
    <AdminForm action={uploadResource} submitLabel="Upload resource" success="Resource uploaded" className="space-y-5" onDone={() => router.push("/admin/resources")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5 sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Resource title</span><input name="title" required minLength={3} maxLength={150} className={inputCls} /></label>
        <FilterSelect label="University" value={s.universityId} onChange={(v) => set("universityId", v)} loading={unis.loading} placeholder="Select university" options={unis.data.map((o) => ({ value: o.id, label: o.name }))} />
        <FilterSelect label="Course" value={s.courseId} onChange={(v) => set("courseId", v)} disabled={!s.universityId} hint="Select university first" loading={courses.loading} placeholder="Select course" options={courses.data.map((o) => ({ value: o.id, label: o.name }))} />
        <FilterSelect label="Branch" value={s.branchId} onChange={(v) => set("branchId", v)} disabled={!s.courseId} hint="Select course first" loading={branches.loading} placeholder="Select branch" options={branches.data.map((o) => ({ value: o.id, label: `${o.name} (${o.code})` }))} />
        <FilterSelect label="Regulation / pattern" value={s.regulationId} onChange={(v) => set("regulationId", v)} disabled={!s.universityId} hint="Select university first" loading={regs.loading} placeholder="Select pattern" options={regs.data.map((o) => ({ value: o.id, label: o.name }))} />
        <FilterSelect label="Student year" value={s.studentYear} onChange={(v) => set("studentYear", v)} placeholder="Select year" options={["FE", "SE", "TE", "BE"].map((y) => ({ value: y, label: y }))} />
        <FilterSelect label="Semester" value={s.semester} onChange={(v) => set("semester", v)} loading={sems.loading} placeholder="Select semester" options={sems.data.map((o) => ({ value: String(o.number), label: `Semester ${o.number}` }))} />
        <div className="sm:col-span-2">
          <input type="hidden" name="subjectId" value={s.subjectId} />
          <FilterSelect label="Subject *" value={s.subjectId} onChange={(v) => set("subjectId", v)} disabled={!s.branchId} hint="Select branch first" loading={subjects.loading} placeholder={subjects.data.length ? "Select subject" : "No subjects for this combination"} options={subjects.data.map((o) => ({ value: o.id, label: `${o.name} (${o.code})` }))} />
        </div>
        <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Resource type</span>
          <select name="categoryId" required className={inputCls} defaultValue=""><option value="">{cats.loading ? "Loading…" : "Select type"}</option>{cats.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Academic year</span>
          <select name="academicYearId" required className={inputCls} defaultValue=""><option value="">{years.loading ? "Loading…" : "Select year"}</option>{years.data.map((y) => <option key={y.id} value={y.id}>{y.label}</option>)}</select></label>
        <label className="block space-y-1.5 sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Description (optional)</span><textarea name="description" rows={3} maxLength={1000} className={`${inputCls} h-auto py-2`} /></label>
        <label className="block space-y-1.5 sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">File ({EXTS.join(", ")} · max {MAX_FILE_BYTES / 1024 / 1024} MB)</span>
          <input name="file" type="file" required accept={EXTS.map((e) => `.${e}`).join(",")} className={`${inputCls} py-1.5 file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1 file:text-sm`}
            onChange={(e) => { const f = e.target.files?.[0]; if (f && f.size > MAX_FILE_BYTES) { toast.error("File is too large"); e.target.value = ""; } }} /></label>
      </div>
    </AdminForm>
  );
}
