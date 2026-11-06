"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleBookmark } from "@/lib/actions/bookmarks";

export function BookmarkButton({ id, initial }: { id: string; initial: boolean }) {
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      variant="ghost" size="icon" disabled={pending} aria-pressed={saved} aria-label={saved ? "Remove from saved" : "Save resource"}
      onClick={() => start(async () => {
        const res = await toggleBookmark(id);
        if (res === null) { toast.info("Log in to save resources"); router.push(`/login?next=${encodeURIComponent(location.pathname + location.search)}`); return; }
        setSaved(res);
        toast.success(res ? "Saved to your library" : "Removed from saved");
      })}
    >
      <Bookmark className={saved ? "fill-primary text-primary" : ""} />
    </Button>
  );
}
