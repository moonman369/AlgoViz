const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

interface OpenRouterChunk {
  choices?: Array<{ delta?: { content?: string | null } }>;
  error?: { message?: string };
}

export function getOpenRouterModel() {
  return process.env.OPENROUTER_MODEL || "openrouter/free";
}

export async function createOpenRouterStream(prompt: string, signal?: AbortSignal) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your_openrouter_api_key_here") {
    throw new Error("Check your OPENROUTER_API_KEY in .env.local");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
      "X-OpenRouter-Title": process.env.OPENROUTER_APP_NAME || "AlgoViz",
    },
    body: JSON.stringify({
      model: getOpenRouterModel(),
      messages: [{ role: "user", content: prompt }],
      max_tokens: 8000,
      reasoning: { enabled: true, exclude: true },
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message || `OpenRouter request failed with status ${response.status}.`);
  }
  if (!response.body) throw new Error("OpenRouter returned an empty response.");

  return extractOpenRouterText(response.body);
}

function extractOpenRouterText(source: ReadableStream<Uint8Array>) {
  const reader = source.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        while (true) {
          const newline = buffer.indexOf("\n");
          if (newline >= 0) {
            const line = buffer.slice(0, newline).trim();
            buffer = buffer.slice(newline + 1);
            if (!line || line.startsWith(":") || !line.startsWith("data:")) continue;

            const data = line.slice(5).trim();
            if (data === "[DONE]") {
              controller.close();
              await reader.cancel();
              return;
            }

            const chunk = JSON.parse(data) as OpenRouterChunk;
            if (chunk.error?.message) throw new Error(chunk.error.message);
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
              return;
            }
            continue;
          }

          const { done, value } = await reader.read();
          if (done) {
            buffer += decoder.decode();
            controller.close();
            return;
          }
          buffer += decoder.decode(value, { stream: true });
        }
      } catch (error) {
        controller.error(error);
        await reader.cancel(error).catch(() => undefined);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}
