"use client";

import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import { LoaderCircle, Play, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EMPTY_FORM, type Difficulty, type VisualizerFormData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  initialData: VisualizerFormData;
  isLoading: boolean;
  onSubmit: (data: VisualizerFormData) => Promise<void>;
}

const difficultyColor: Record<Difficulty, string> = {
  Easy: "text-green-600 dark:text-green-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Hard: "text-red-600 dark:text-red-400",
};

export function VisualizerForm({ initialData, isLoading, onSubmit }: Props) {
  const [form, setForm] = useState<VisualizerFormData>(EMPTY_FORM);
  const [tag, setTag] = useState("");

  useEffect(() => setForm(initialData), [initialData]);

  const update = <K extends keyof VisualizerFormData>(key: K, value: VisualizerFormData[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const addTag = () => {
    const next = tag.trim();
    if (next && !form.topics.includes(next)) update("topics", [...form.topics, next]);
    setTag("");
  };

  const handleTagKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <Card className="p-5">
      <div className="mb-5">
        <h1 className="text-xl font-semibold">Build a visualizer</h1>
        <p className="mt-1 text-sm text-muted-foreground">Describe an algorithm and generate an interactive walkthrough.</p>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Problem">
          <Input required value={form.problemName} onChange={(e) => update("problemName", e.target.value)} placeholder="Problem name or LeetCode URL" />
        </Field>
        <Field label="Difficulty">
          <Select value={form.difficulty} onValueChange={(value) => update("difficulty", value as Difficulty)}>
            <SelectTrigger className={difficultyColor[form.difficulty]}><SelectValue /></SelectTrigger>
            <SelectContent>{(["Easy", "Medium", "Hard"] as Difficulty[]).map((item) => <SelectItem key={item} value={item} className={difficultyColor[item]}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Algorithm / Approach">
          <Input required value={form.approach} onChange={(e) => update("approach", e.target.value)} placeholder="e.g. Monotonic Stack" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Time complexity"><Input className="font-mono" value={form.timeComplexity} onChange={(e) => update("timeComplexity", e.target.value)} placeholder="O(n log n)" /></Field>
          <Field label="Space complexity"><Input className="font-mono" value={form.spaceComplexity} onChange={(e) => update("spaceComplexity", e.target.value)} placeholder="O(n)" /></Field>
        </div>
        <Field label="Topics">
          <div className="flex gap-2"><Input value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={handleTagKey} placeholder="Add a topic" /><Button type="button" variant="outline" size="icon" onClick={addTag}><Plus className="h-4 w-4" /></Button></div>
          {form.topics.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{form.topics.map((topic) => <Badge key={topic} className="gap-1 bg-blue-600/10 text-blue-700 dark:text-blue-300">{topic}<button type="button" aria-label={`Remove ${topic}`} onClick={() => update("topics", form.topics.filter((item) => item !== topic))}><X className="h-3 w-3" /></button></Badge>)}</div>}
        </Field>
        <Field label="Sample input"><Input value={form.sampleInput} onChange={(e) => update("sampleInput", e.target.value)} placeholder="e.g. nums = [3,2,1,6,0,5]" /></Field>
        <Field label="Extra instructions"><Textarea value={form.extraNotes} onChange={(e) => update("extraNotes", e.target.value)} placeholder="Extra instructions for the visualizer" /></Field>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          {isLoading ? "Generating…" : "Generate Visualizer"}
        </Button>
      </form>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className={cn("block text-sm font-medium")}><span className="mb-1.5 block">{label}</span>{children}</label>;
}
