import { nanoid } from "nanoid";
import type { HistoryItem, VisualizerFormData } from "@/lib/types";

const HISTORY_KEY = "algviz_history";
const MAX_ITEMS = 20;

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveToHistory(data: VisualizerFormData, html: string): HistoryItem {
  const item: HistoryItem = { ...data, id: nanoid(), html, createdAt: Date.now() };
  const items = [item, ...loadHistory()].slice(0, MAX_ITEMS);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("algviz-history-change"));
  return item;
}

export function deleteFromHistory(id: string) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(loadHistory().filter((item) => item.id !== id)));
  window.dispatchEvent(new Event("algviz-history-change"));
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  window.dispatchEvent(new Event("algviz-history-change"));
}
