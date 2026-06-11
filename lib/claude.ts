import Anthropic from "@anthropic-ai/sdk";
import type { VisualizerFormData } from "@/lib/types";

export function createAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_anthropic_api_key_here") {
    throw new Error("Check your ANTHROPIC_API_KEY in .env.local");
  }
  return new Anthropic({ apiKey });
}

export function getAnthropicModel() {
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
}

export function buildVisualizerPrompt(data: VisualizerFormData) {
  return `Create an interactive educational algorithm visualizer from this specification:
${JSON.stringify(data, null, 2)}

Return ONLY one complete, self-contained HTML document. Do not use markdown fences and do not provide any explanation outside the HTML.

Requirements:
- Use only vanilla HTML, CSS, JavaScript, and inline SVG. Do not load external libraries, fonts, images, or other resources.
- Use a polished dark interface with background #0f0f0f and text #e5e5e5.
- Clearly visualize the relevant data structure as SVG at every algorithm step.
- Include Prev, Next, Play, and Pause controls with correct disabled states and a visible step counter.
- Include a step-description box that clearly explains the operation and why it happens.
- Show useful auxiliary state such as current indices, variables, stack, queue, visited set, result, or recursion state.
- Include a custom input field and Reset button. Parse reasonable custom inputs safely and show an inline validation error when invalid.
- Include a color legend and consistently use its colors.
- Make the layout responsive and educational, with enough detail to teach the algorithm mechanics.
- Escape user-controlled values before inserting them into the DOM. Do not use eval.
- On render and resize, post the document height to the parent with:
  parent.postMessage({ type: "algviz-resize", height: document.documentElement.scrollHeight }, "*");
- The document must run correctly inside an iframe sandboxed with allow-scripts but without allow-same-origin.
- Ensure all controls, sample data, custom input handling, step generation, SVG rendering, and animation logic are fully implemented.`;
}
