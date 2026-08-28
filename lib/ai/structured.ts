import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { AiStep } from "@/lib/ai/schemas";
import type { StepResponse } from "@/types/domain";

export interface StructuredProvider {
  responses: {
    parse: (request: Record<string, unknown>) => Promise<{ output_parsed?: unknown }>;
  };
}

export function buildStructuredRequest<T>(step: AiStep<T>, input: unknown) {
  return {
    model: "gpt-4o-mini" as const,
    instructions: step.instructions,
    input: typeof input === "string" ? input : JSON.stringify(input),
    text: { format: zodTextFormat(step.schema, step.functionName) },
  };
}

function defaultProvider(): StructuredProvider | null {
  if (process.env.NODE_ENV === "test" || !process.env.OPENAI_API_KEY) return null;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client as unknown as StructuredProvider;
}

export async function runStructuredStep<TInput, TOutput>({
  step,
  input,
  fallback,
  provider = defaultProvider(),
}: {
  step: AiStep<TOutput>;
  input: TInput;
  fallback: () => TOutput;
  provider?: StructuredProvider | null;
}): Promise<StepResponse<TInput, TOutput>> {
  let output: TOutput;
  let mode: "openai" | "demo" = "demo";
  if (provider) {
    try {
      const response = await provider.responses.parse(buildStructuredRequest(step, input));
      output = step.schema.parse(response.output_parsed);
      mode = "openai";
    } catch {
      output = fallback();
    }
  } else {
    output = fallback();
  }
  const trace = { step: step.step, functionName: step.functionName, mode, input, output } as const;
  console.info(`[Nyaya-Setu][Step ${step.step}]`, trace);
  return { result: output, trace };
}
