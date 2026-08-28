export const SUBJECT_CATEGORIES = [
  "roads_infrastructure",
  "municipal_sanitation",
  "electricity_utility",
  "land_revenue",
  "police_conduct",
  "education_scheme",
  "healthcare_scheme",
  "welfare_pension",
  "other",
] as const;

export type SubjectCategory = (typeof SUBJECT_CATEGORIES)[number];
export type Confidence = "high" | "medium" | "low";
export type RiskLevel = "low" | "medium" | "high";
export type PrecedentOutcome = "answered_in_full" | "answered_partially" | "rejected_with_reason" | "transferred";

export interface Department {
  id: string;
  name: string;
  subject_tags: SubjectCategory[];
  pio_name: string;
  mock_address: string;
  avg_reply_days: number;
  pin_code_prefixes: string[];
}

export interface ClassificationResult {
  subject_category: SubjectCategory;
  likely_department_id: string;
  confidence: Confidence;
  needs_clarification: boolean;
  clarifying_question: string | null;
}

export interface TranslationResult {
  compliant_request_text: string;
  citizen_explanation: string;
  requested_records: string[];
}

export interface RiskFlag {
  clause: string;
  explanation: string;
  suggestion: string;
}

export interface RiskResult {
  risk_flags: RiskFlag[];
  overall_risk: RiskLevel;
}

export interface PrecedentRecord {
  precedent_id: string;
  subject_category: SubjectCategory;
  synthetic_request_summary: string;
  outcome: PrecedentOutcome;
  outcome_note: string;
}

export interface PrecedentMatch {
  precedent_id: string;
  similarity_reason: string;
  outcome: PrecedentOutcome;
  outcome_note: string;
}

export interface PrecedentResult {
  precedents: PrecedentMatch[];
}

export interface AppealResult {
  appeal_letter_text: string;
  citizen_explanation: string;
}

export interface StepTrace<TInput, TOutput> {
  step: "A" | "B" | "C" | "D" | "E";
  functionName: string;
  mode: "openai" | "demo";
  input: TInput;
  output: TOutput;
}

export interface StepResponse<TInput, TOutput> {
  result: TOutput;
  trace: StepTrace<TInput, TOutput>;
}

export interface StoredApplication {
  id: string;
  tracking_id: string;
  access_code: string;
  citizen_phone: string;
  raw_grievance: string;
  compliant_request_text: string;
  department_id: string;
  risk_flags: RiskFlag[];
  precedents_shown: PrecedentMatch[];
  requested_records: string[];
  status: "submitted" | "transferred" | "awaiting_reply" | "overdue";
  created_at: string;
  days_elapsed_mock: number;
  transferred: boolean;
}
