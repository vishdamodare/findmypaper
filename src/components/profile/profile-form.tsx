"use client";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilterSelect } from "@/components/finder/filter-select";
import { useOptions } from "@/components/finder/use-options";
import { updateProfile } from "@/lib/actions/profile";

type P = { name: string; email: string; universityId: string; courseId: string; branchId: string; academicYearId: string; semesterNo: string };

export function ProfileForm({ initial }: { initial: P }) {
  const [v, setV] = useState(initial);
  const [pending, start] = useTransition();
  const set = (k: keyof P, val: string) => setV((c) => ({ ...c, [k]: val, ...(k === "universityId" ? { courseId: "", branchId: "" } : {}), ...(k === "courseId" ? { branchId: "" } : {}) }));
  const unis = useOptions<{ id: string; name: string }>("universities", {});
  const courses = useOptions<{ id: string; name: string }>("courses", { universityId: v.universityId }, !!v.universityId);
  const branches = useOptions<{ id: string; name: string; code: string }>("branches", { courseId: v.courseId }, !!v.courseId);
  const years = useOptions<{ id: string; label: string }>("academicYears", {});
  const sems = useOptions<{ number: number }>("semesters", {});

  return (
    <form className="space-y-5" onSubmit={(e) => {
      e.preventDefault();
      start(async () => {
        const r = await updateProfile(v);
        if (r.ok) toast.success("Profile saved");
        else toast.error(r.error ?? "Could not save");
      });
    }}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor="name">Name</Label><Input id="name" className="h-10" value={v.name} onChange={(e) => set("name", e.target.value)} required minLength={2} /></div>
        <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" className="h-10" value={v.email} disabled /></div>
        <FilterSelect label="University" value={v.universityId} onChange={(x) => set("universityId", x)} loading={unis.loading} placeholder="Select university" options={unis.data.map((o) => ({ value: o.id, label: o.name }))} />
        <FilterSelect label="Course" value={v.courseId} onChange={(x) => set("courseId", x)} disabled={!v.universityId} hint="Select university first" loading={courses.loading} placeholder="Select course" options={courses.data.map((o) => ({ value: o.id, label: o.name }))} />
        <FilterSelect label="Branch" value={v.branchId} onChange={(x) => set("branchId", x)} disabled={!v.courseId} hint="Select course first" loading={branches.loading} placeholder="Select branch" options={branches.data.map((o) => ({ value: o.id, label: `${o.name} (${o.code})` }))} />
        <FilterSelect label="Academic year" value={v.academicYearId} onChange={(x) => set("academicYearId", x)} loading={years.loading} placeholder="Select year" options={years.data.map((o) => ({ value: o.id, label: o.label }))} />
        <FilterSelect label="Current semester" value={v.semesterNo} onChange={(x) => set("semesterNo", x)} loading={sems.loading} placeholder="Select semester" options={sems.data.map((o) => ({ value: String(o.number), label: `Semester ${o.number}` }))} />
      </div>
      <Button type="submit" className="h-10" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Save profile</Button>
    </form>
  );
}
