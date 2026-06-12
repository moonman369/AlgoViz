import { createVisualizerStream } from "@/lib/ai";
import type { VisualizerFormData } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VisualizerFormData;
    if (!body.problemName?.trim() || !body.approach?.trim()) {
      return Response.json({ error: "Problem name and algorithm approach are required." }, { status: 400 });
    }

    const readable = await createVisualizerStream(body, request.signal);

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate visualizer.";
    return Response.json({ error: message }, { status: 500 });
  }
}
