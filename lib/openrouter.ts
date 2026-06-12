const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

interface OpenRouterChunk {
  choices?: Array<{
    delta?: { content?: string | null; reasoning?: string | null };
    finish_reason?: string | null;
  }>;
  error?: { message?: string };
}

interface OpenRouterResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
}

export function getOpenRouterModel() {
  return process.env.OPENROUTER_MODEL || "openrouter/free";
}

export async function createOpenRouterStream(
  prompt: string,
  signal?: AbortSignal,
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your_openrouter_api_key_here") {
    throw new Error("Check your OPENROUTER_API_KEY in .env.local");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream, application/json",
      "HTTP-Referer":
        process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
      "X-OpenRouter-Title": process.env.OPENROUTER_APP_NAME || "AlgoViz",
    },
    body: JSON.stringify({
      model: getOpenRouterModel(),
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000,
      reasoning: { effort: "low", exclude: true },
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(
      body?.error?.message ||
        `OpenRouter request failed with status ${response.status}.`,
    );
  }
  if (!response.body) throw new Error("OpenRouter returned an empty response.");

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/event-stream"))
    return extractOpenRouterSSEText(response.body);

  const payload = (await response.json()) as OpenRouterResponse;
  if (payload.error?.message) throw new Error(payload.error.message);
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned no visualizer content.");
  return streamText(content);
}

function extractOpenRouterSSEText(source: ReadableStream<Uint8Array>) {
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
            if (!line || line.startsWith(":") || !line.startsWith("data:"))
              continue;

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
            const content = parseSSEEvent(buffer);
            if (content && content !== "[DONE]")
              controller.enqueue(encoder.encode(content));
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

function parseSSEEvent(event: string) {
  const data = event
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n")
    .trim();

  if (!data || data === "[DONE]") return data || null;
  const chunk = JSON.parse(data) as OpenRouterChunk;
  if (chunk.error?.message) throw new Error(chunk.error.message);
  const finishReason = chunk.choices?.[0]?.finish_reason;
  if (finishReason === "length") {
    throw new Error(
      "The model reached its output limit before completing the visualizer. Try a simpler request.",
    );
  }
  if (finishReason === "error")
    throw new Error(
      "The OpenRouter provider stopped before completing the visualizer.",
    );
  return chunk.choices?.[0]?.delta?.content || null;
}

function streamText(content: string) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(content));
      controller.close();
    },
  });
}
