"use client";

import { Clock3, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar({ onHistoryOpen }: { onHistoryOpen: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-white"><Network className="h-5 w-5" /></span>
          AlgoViz
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" onClick={onHistoryOpen}><Clock3 className="mr-2 h-4 w-4" />History</Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
