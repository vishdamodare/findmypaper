import type { Metadata } from "next";
import { ResourceFinder } from "@/components/finder/resource-finder";

export const metadata: Metadata = { title: "Explore Resources" };

export default function Explore() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Find your study resources</h1>
      <p className="mt-2 mb-8 text-muted-foreground">Narrow down by university, branch, semester and subject. Only options that exist for your selection are shown.</p>
      <ResourceFinder />
    </div>
  );
}
