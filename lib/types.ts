export type Difficulty = "Easy" | "Medium" | "Hard";

export interface VisualizerFormData {
  problemName: string;
  difficulty: Difficulty;
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  topics: string[];
  sampleInput: string;
  extraNotes: string;
}

export interface HistoryItem extends VisualizerFormData {
  id: string;
  html: string;
  createdAt: number;
}

export const EMPTY_FORM: VisualizerFormData = {
  problemName: "",
  difficulty: "Medium",
  approach: "",
  timeComplexity: "",
  spaceComplexity: "",
  topics: [],
  sampleInput: "",
  extraNotes: "",
};
