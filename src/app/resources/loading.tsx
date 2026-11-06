import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-7 w-56" />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-60 rounded-2xl" />)}</div>
    </div>
  );
}
