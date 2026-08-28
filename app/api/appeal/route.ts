import { aiSteps, inputSchemas } from "@/lib/ai/schemas";
import { runStructuredStep } from "@/lib/ai/structured";
import { parseRouteInput } from "@/lib/api";
import { draftAppealDemo } from "@/lib/demo-ai";

export async function POST(request: Request) {
  const parsed = await parseRouteInput(request, inputSchemas.appeal, "We need the original request, department, and elapsed days to draft an appeal.");
  if (!parsed.ok) return parsed.response;
  return Response.json(await runStructuredStep({ step: aiSteps.appeal, input: parsed.data, fallback: () => draftAppealDemo(parsed.data.original_request_text, parsed.data.department_name, parsed.data.days_elapsed) }));
}
