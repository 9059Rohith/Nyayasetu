import { aiSteps, inputSchemas } from "@/lib/ai/schemas";
import { runStructuredStep } from "@/lib/ai/structured";
import { parseRouteInput } from "@/lib/api";
import { findPrecedentsDemo } from "@/lib/demo-ai";

export async function POST(request: Request) {
  const parsed = await parseRouteInput(request, inputSchemas.precedents, "Add a complete draft before finding similar examples.");
  if (!parsed.ok) return parsed.response;
  return Response.json(await runStructuredStep({ step: aiSteps.precedents, input: parsed.data, fallback: () => findPrecedentsDemo(parsed.data.subject_category, parsed.data.compliant_request_text) }));
}
