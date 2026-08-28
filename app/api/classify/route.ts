import { aiSteps, inputSchemas } from "@/lib/ai/schemas";
import { runStructuredStep } from "@/lib/ai/structured";
import { parseRouteInput } from "@/lib/api";
import { classifyDemo } from "@/lib/demo-ai";

export async function POST(request: Request) {
  const parsed = await parseRouteInput(request, inputSchemas.classify, "Tell us what happened before continuing.");
  if (!parsed.ok) return parsed.response;
  return Response.json(await runStructuredStep({ step: aiSteps.classify, input: parsed.data, fallback: () => classifyDemo(parsed.data.raw_grievance, parsed.data.pin_code) }));
}
