import type {
  ClassificationResult,
  PrecedentMatch,
  RiskResult,
  StepTrace,
  StoredApplication,
  SubjectCategory,
} from "@/types/domain";

export type Language = "en" | "hi";
export type FlowStep = "landing" | "login" | "draft" | "review" | "confirmation" | "tracking";

export interface DraftState {
  version: 1;
  language: Language;
  step: FlowStep;
  rawGrievance: string;
  pinCode: string;
  phone: string;
  otp: string;
  category: SubjectCategory | "";
  departmentId: string;
  classification: ClassificationResult | null;
  clarificationAnswer: string;
  compliantRequest: string;
  citizenExplanation: string;
  requestedRecords: string[];
  risk: RiskResult | null;
  precedents: PrecedentMatch[];
  traces: Array<StepTrace<unknown, unknown>>;
  highRiskAccepted: boolean;
  isBpl: boolean;
  bplFileName: string;
  paid: boolean;
  application: StoredApplication | null;
}
