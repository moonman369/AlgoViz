"use client";

import { useEffect, useState } from "react";
import { Binary, Check, Clipboard, Download, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Difficulty } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  html: string | null;
  isLoading: boolean;
  problemName?: string;
  difficulty?: Difficulty;
}

const difficultyStyles: Record<Difficulty, string> = {
  Easy: "bg-green-500/15 text-green-600 dark:text-green-400",
  Medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Hard: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function VisualizerOutput({ html, isLoading, problemName, difficulty }: Props) {
  const [copied, setCopied] = useState(false);
  const [height, setHeight] = useState(760);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.data?.type === "algviz-resize" && Number.isFinite(event.data.height)) setHeight(Math.max(600, event.data.height));
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  const download = () => {
    if (!html) return;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(problemName || "algviz").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    if (!html) return;
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isLoading) return <StateCard><LoaderCircle className="h-12 w-12 animate-spin text-blue-500" /><p className="text-lg font-medium">Generating your visualizer…</p><div className="flex gap-1">{[0, 1, 2].map((item) => <span key={item} className="h-2 w-2 animate-pulse rounded-full bg-blue-500" style={{ animationDelay: `${item * 180}ms` }} />)}</div></StateCard>;
  if (!html) return <StateCard><span className="grid h-20 w-20 place-items-center rounded-2xl bg-blue-500/10"><Binary className="h-10 w-10 text-blue-500" /></span><div className="text-center"><p className="text-lg font-medium">Your interactive visualizer will appear here</p><p className="mt-1 text-sm text-muted-foreground">Fill in the form to create an educational walkthrough.</p></div></StateCard>;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-3">
        <div className="flex items-center gap-2"><Badge>{problemName || "Visualizer"}</Badge>{difficulty && <Badge className={difficultyStyles[difficulty]}>{difficulty}</Badge>}</div>
        <div className="flex gap-2"><Button size="sm" variant="outline" onClick={download}><Download className="mr-1.5 h-4 w-4" />Download HTML</Button><Button size="sm" variant="outline" onClick={copy}>{copied ? <Check className="mr-1.5 h-4 w-4" /> : <Clipboard className="mr-1.5 h-4 w-4" />}{copied ? "Copied" : "Copy HTML"}</Button></div>
      </div>
      <div className="bg-zinc-950"><iframe title={`${problemName || "Algorithm"} visualizer`} srcDoc={html} sandbox="allow-scripts" className="block w-full border-0" style={{ height }} /></div>
    </Card>
  );
}

function StateCard({ children }: { children: React.ReactNode }) {
  return <Card className={cn("flex min-h-[70vh] flex-col items-center justify-center gap-5 border-dashed p-8")}>{children}</Card>;
}
