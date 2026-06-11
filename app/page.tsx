"use client";

import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { HistoryPanel } from "@/components/HistoryPanel";
import { Navbar } from "@/components/Navbar";
import { VisualizerForm } from "@/components/VisualizerForm";
import { VisualizerOutput } from "@/components/VisualizerOutput";
import { Button } from "@/components/ui/button";
import { saveToHistory } from "@/lib/storage";
import { EMPTY_FORM, type HistoryItem, type VisualizerFormData } from "@/lib/types";

export default function Home() {
  const [formData, setFormData] = useState<VisualizerFormData>(EMPTY_FORM);
  const [outputData, setOutputData] = useState<VisualizerFormData | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (data: VisualizerFormData) => {
    setFormData(data);
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Could not generate the visualizer.");
      }
      if (!response.body) throw new Error("The server returned an empty response.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let html = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
      }
      html += decoder.decode();
      const normalized = html.trim();
      if (!/^<!doctype html/i.test(normalized) && !/^<html/i.test(normalized)) {
        throw new Error("Generation failed — model returned unexpected output. Try again.");
      }
      setGeneratedHtml(normalized);
      setOutputData(data);
      saveToHistory(data, normalized);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not generate the visualizer.");
    } finally {
      setIsLoading(false);
    }
  };

  const restore = (item: HistoryItem) => {
    const { id: _id, html, createdAt: _createdAt, ...data } = item;
    setFormData(data);
    setOutputData(data);
    setGeneratedHtml(html);
    setError(null);
  };

  return (
    <div className="min-h-screen">
      <Navbar onHistoryOpen={() => setHistoryOpen(true)} />
      {error && <div className="mx-auto mt-4 flex max-w-[1800px] items-center gap-3 px-4 sm:px-6"><div className="flex w-full items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"><AlertCircle className="h-4 w-4 shrink-0" /><span className="flex-1">{error}</span><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setError(null)}><X className="h-4 w-4" /></Button></div></div>}
      <main className="mx-auto grid max-w-[1800px] gap-5 p-4 sm:p-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-[88px]"><VisualizerForm initialData={formData} isLoading={isLoading} onSubmit={generate} /></div>
        <VisualizerOutput html={generatedHtml} isLoading={isLoading} problemName={outputData?.problemName} difficulty={outputData?.difficulty} />
      </main>
      <HistoryPanel open={historyOpen} onOpenChange={setHistoryOpen} onRestore={restore} />
    </div>
  );
}
