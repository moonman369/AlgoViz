"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock3, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { clearHistory, deleteFromHistory, loadHistory } from "@/lib/storage";
import type { HistoryItem } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: (item: HistoryItem) => void;
}

export function HistoryPanel({ open, onOpenChange, onRestore }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const refresh = useCallback(() => setItems(loadHistory()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("algviz-history-change", refresh);
    return () => window.removeEventListener("algviz-history-change", refresh);
  }, [refresh]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader><SheetTitle className="text-xl font-semibold">History</SheetTitle><SheetDescription>Restore or manage previous visualizations.</SheetDescription></SheetHeader>
        {items.length === 0 ? <div className="grid min-h-72 place-items-center text-center text-muted-foreground"><div><Clock3 className="mx-auto mb-3 h-9 w-9" /><p>No visualizations yet</p></div></div> : <div className="space-y-3">{items.map((item) => <button key={item.id} className="group w-full rounded-lg border border-border p-4 text-left transition-all hover:border-blue-500 hover:bg-muted/50" onClick={() => { onRestore(item); onOpenChange(false); }}><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate font-medium">{item.problemName}</p><p className="mt-1 truncate text-sm text-muted-foreground">{item.approach}</p></div><Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0 opacity-70 hover:text-red-500" onClick={(event) => { event.stopPropagation(); deleteFromHistory(item.id); }}><Trash2 className="h-4 w-4" /></Button></div><div className="mt-3 flex items-center justify-between"><Badge>{item.difficulty}</Badge><span className="text-xs text-muted-foreground">{relativeTime(item.createdAt)}</span></div></button>)}</div>}
        {items.length > 0 && <Button variant="destructive" className="mt-5 w-full" onClick={clearHistory}>Clear all</Button>}
      </SheetContent>
    </Sheet>
  );
}

function relativeTime(timestamp: number) {
  const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
