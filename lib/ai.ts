import { buildVisualizerPrompt, createAnthropicClient, getAnthropicModel } from "@/lib/claude";
import { createOpenRouterStream } from "@/lib/openrouter";
import type { VisualizerFormData } from "@/lib/types";

export type AIProvider = "openrouter" | "anthropic";

export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "openrouter").toLowerCase();
  if (provider !== "openrouter" && provider !== "anthropic") {
    throw new Error('AI_PROVIDER must be either "openrouter" or "anthropic".');
  }
  return provider;
}

export async function createVisualizerStream(data: VisualizerFormData, signal?: AbortSignal) {
  const prompt = buildVisualizerPrompt(data);
  if (getAIProvider() === "openrouter") return createOpenRouterStream(prompt, signal);
  return createAnthropicStream(prompt, signal);
}

function createAnthropicStream(prompt: string, signal?: AbortSignal) {
  const anthropic = createAnthropicClient();
  const stream = anthropic.messages.stream({
    model: getAnthropicModel(),
    max_tokens: 6000,
    messages: [{ role: "user", content: prompt }],
  });
  const encoder = new TextEncoder();
  signal?.addEventListener("abort", () => stream.abort(), { once: true });

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "message_delta" && event.delta.stop_reason === "max_tokens") {
            throw new Error("The model reached its output limit before completing the visualizer. Try a simpler request.");
          }
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      stream.abort();
    },
  });
}
