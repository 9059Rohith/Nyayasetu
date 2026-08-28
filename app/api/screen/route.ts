import { aiSteps, inputSchemas } from "@/lib/ai/schemas";
import { runStructuredStep } from "@/lib/ai/structured";
import { parseRouteInput } from "@/lib/api";
import { screenDemo } from "@/lib/demo-ai";

export async function POST(request: Request) {
  const parsed = await parseRouteInput(request, inputSchemas.screen, "Add a complete draft before checking it.");
  if (!parsed.ok) return parsed.response;
  return Response.json(await runStructuredStep({ step: aiSteps.screen, input: parsed.data, fallback: () => screenDemo(parsed.data.compliant_request_text, parsed.data.subject_category) }));
}
