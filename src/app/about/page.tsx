import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Us" };

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">About FindMyPaper</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>FindMyPaper helps students find the right study material fast. Instead of searching through scattered groups and drives, pick your university, branch, semester and subject and see only what applies to you.</p>
        <p>Resources are uploaded and managed by administrators. Everything marked <strong>Demo</strong> is a generated placeholder and not an authentic university document.</p>
        <p>Questions or want to contribute material? Write to hello@findmypaper.local.</p>
      </div>
    </div>
  );
}
