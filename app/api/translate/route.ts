import { aiSteps, inputSchemas } from "@/lib/ai/schemas";
import { runStructuredStep } from "@/lib/ai/structured";
import { parseRouteInput } from "@/lib/api";
import { translateDemo } from "@/lib/demo-ai";

export async function POST(request: Request) {
  const parsed = await parseRouteInput(request, inputSchemas.translate, "We need a grievance, category, and department to prepare the draft.");
  if (!parsed.ok) return parsed.response;
  return Response.json(await runStructuredStep({ step: aiSteps.translate, input: parsed.data, fallback: () => translateDemo(parsed.data.raw_grievance, parsed.data.subject_category, parsed.data.department_name) }));
}
