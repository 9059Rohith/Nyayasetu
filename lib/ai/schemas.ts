import { z } from "zod";
import { SUBJECT_CATEGORIES } from "@/types/domain";
import { prompts } from "@/lib/ai/prompts";

const category = z.enum(SUBJECT_CATEGORIES);

const classification = z.object({
  subject_category: category,
  likely_department_id: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  needs_clarification: z.boolean(),
  clarifying_question: z.string().nullable(),
}).strict();

const translation = z.object({
  compliant_request_text: z.string().max(3000),
  citizen_explanation: z.string(),
  requested_records: z.array(z.string()).min(1).max(3),
}).strict();

const risk = z.object({
  risk_flags: z.array(z.object({ clause: z.string(), explanation: z.string(), suggestion: z.string() }).strict()),
  overall_risk: z.enum(["low", "medium", "high"]),
}).strict();

const precedent = z.object({
  precedents: z.array(z.object({
    precedent_id: z.string(),
    similarity_reason: z.string(),
    outcome: z.enum(["answered_in_full", "answered_partially", "rejected_with_reason", "transferred"]),
    outcome_note: z.string(),
  }).strict()).min(2).max(3),
}).strict();

const appeal = z.object({
  appeal_letter_text: z.string().max(3000),
  citizen_explanation: z.string(),
}).strict();

export interface AiStep<T = unknown> {
  step: "A" | "B" | "C" | "D" | "E";
  functionName: string;
  instructions: string;
  schema: z.ZodType<T>;
  requiredFields: string[];
}

export const aiSteps = {
  classify: { step: "A", functionName: "classify_and_route", instructions: prompts.classify, schema: classification, requiredFields: ["subject_category", "likely_department_id", "confidence", "needs_clarification", "clarifying_question"] },
  translate: { step: "B", functionName: "translate_to_compliant_request", instructions: prompts.translate, schema: translation, requiredFields: ["compliant_request_text", "citizen_explanation", "requested_records"] },
  screen: { step: "C", functionName: "screen_exemption_risk", instructions: prompts.screen, schema: risk, requiredFields: ["risk_flags", "overall_risk"] },
  precedents: { step: "D", functionName: "find_similar_precedents", instructions: prompts.precedents, schema: precedent, requiredFields: ["precedents"] },
  appeal: { step: "E", functionName: "draft_first_appeal", instructions: prompts.appeal, schema: appeal, requiredFields: ["appeal_letter_text", "citizen_explanation"] },
} satisfies Record<string, AiStep<unknown>>;

export const inputSchemas = {
  classify: z.object({ raw_grievance: z.string().trim().min(10), pin_code: z.union([z.string().regex(/^\d{6}$/), z.null()]) }).strict(),
  translate: z.object({ raw_grievance: z.string().trim().min(10), subject_category: category, department_name: z.string().trim().min(2) }).strict(),
  screen: z.object({ compliant_request_text: z.string().trim().min(10).max(3500), subject_category: category }).strict(),
  precedents: z.object({ compliant_request_text: z.string().trim().min(10).max(3000), subject_category: category }).strict(),
  appeal: z.object({ original_request_text: z.string().trim().min(10).max(3000), department_name: z.string().trim().min(2), days_elapsed: z.number().int().min(0).max(3650) }).strict(),
};
