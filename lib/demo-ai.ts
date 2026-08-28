import precedentsData from "@/data/precedents.json";
import { chooseDepartment, detectCategory } from "@/lib/routing";
import type {
  AppealResult,
  ClassificationResult,
  PrecedentRecord,
  PrecedentResult,
  RiskFlag,
  RiskResult,
  SubjectCategory,
  TranslationResult,
} from "@/types/domain";

const precedents = precedentsData as PrecedentRecord[];

const RECORDS: Record<SubjectCategory, string[]> = {
  roads_infrastructure: ["certified copy of the sanctioned work order", "copy of the latest inspection report for the identified road", "copy of the item-wise expenditure and completion record"],
  municipal_sanitation: ["copy of the waste collection schedule for the identified area", "copy of complaint register entries for the stated period", "copy of contractor attendance and action-taken records"],
  electricity_utility: ["copy of the streetlight fault register entry for the identified location", "copy of the repair work order and completion entry", "copy of the applicable maintenance schedule or contract extract"],
  land_revenue: ["certified copy of the relevant land or mutation register entry", "copy of the file movement sheet for the stated application", "copy of orders or notices issued on that file"],
  police_conduct: ["copy of the complaint diary or receipt entry for the applicant's complaint", "copy of the action-taken record available on that complaint", "copy of the applicable duty roster for the stated date and desk"],
  education_scheme: ["copy of the current scheme eligibility rules or circular", "copy of the applicant's processing or scrutiny sheet", "copy of the sanction, rejection, or deficiency communication"],
  healthcare_scheme: ["copy of the current scheme eligibility circular", "copy of the applicant's claim processing record", "copy of the sanction, rejection, or deficiency communication"],
  welfare_pension: ["copy of the current eligibility rules or circular", "copy of the applicant's file movement record", "copy of the sanction, rejection, or deficiency communication"],
  other: ["copy of the inward register entry for the citizen's submission", "copy of the file movement record and current recorded status", "copy of orders, notes, or action-taken entries on that file"],
};

export function classifyDemo(rawGrievance: string, pinCode: string | null): ClassificationResult {
  const { category, matches } = detectCategory(rawGrievance);
  const department = chooseDepartment(category, pinCode);
  const needsClarification = matches === 0;
  return {
    subject_category: category,
    likely_department_id: department.id,
    confidence: matches >= 1 ? "high" : "low",
    needs_clarification: needsClarification,
    clarifying_question: needsClarification ? "Which public service or government office is this about?" : null,
  };
}

export function translateDemo(rawGrievance: string, subjectCategory: SubjectCategory, departmentName: string): TranslationResult {
  const records = RECORDS[subjectCategory];
  const locatingContext = rawGrievance
    .replace(/^\s*why\s+(?:has|have|is|are|was|were|did|does)\s+/i, "Reported issue: ")
    .replace(/[?]+$/g, ".")
    .slice(0, 700);
  const body = [
    `To: The Public Information Officer, ${departmentName}`,
    "",
    "Under the Right to Information Act, 2005, please provide the following existing records:",
    ...records.map((record, index) => `${index + 1}. Please provide a ${record}.`),
    "",
    `Context for locating the records: ${locatingContext}`,
    "",
    "Please provide the records electronically where available. If another public authority holds any requested record, please transfer that part of this application under Section 6(3).",
  ].join("\n").slice(0, 3000);
  return {
    compliant_request_text: body,
    citizen_explanation: "You described what went wrong. Offices can respond more clearly when asked for records they already hold, so the draft asks for specific files, logs, and orders while keeping your original concern as context.",
    requested_records: records,
  };
}

export function screenDemo(compliantRequestText: string, subjectCategory: SubjectCategory): RiskResult {
  void subjectCategory;
  const text = compliantRequestText.toLocaleLowerCase();
  const flags: RiskFlag[] = [];
  if (/private|medical records|home address|personal details|unrelated person/.test(text)) {
    flags.push({ clause: "8(1)(j)", explanation: "This may ask for another person's private information.", suggestion: "Limit the request to your own record, public rules, or anonymized totals." });
  }
  if (/investigation|witness|informant/.test(text)) {
    flags.push({ clause: "Ongoing investigation / safety", explanation: "Some investigation or identity records may put a person or active case at risk.", suggestion: "Ask for the complaint receipt, final outcome, or records that can be shared after the inquiry closes." });
  }
  if (/national security|military deployment|classified/.test(text)) {
    flags.push({ clause: "8(1)(a)", explanation: "The request may concern national security or protected operational information.", suggestion: "Narrow it to non-sensitive policy, expenditure, or final administrative records." });
  }
  if (compliantRequestText.length > 3000) {
    flags.push({ clause: "Portal length", explanation: "The draft is longer than the approximate 3,000-character portal limit.", suggestion: "Remove repetition and keep only the records needed for your concern." });
  }
  return { risk_flags: flags, overall_risk: flags.length === 0 ? "low" : flags.some((flag) => flag.clause === "8(1)(j)" || flag.clause === "8(1)(a)") ? "high" : "medium" };
}

export function findPrecedentsDemo(subjectCategory: SubjectCategory, compliantRequestText: string): PrecedentResult {
  const tokens = new Set(compliantRequestText.toLocaleLowerCase().split(/\W+/).filter((token) => token.length > 4));
  return {
    precedents: precedents
      .filter((item) => item.subject_category === subjectCategory)
      .map((item) => ({
        item,
        score: item.synthetic_request_summary.toLocaleLowerCase().split(/\W+/).filter((token) => tokens.has(token)).length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ item }) => ({
        precedent_id: item.precedent_id,
        similarity_reason: `Like your draft, this synthetic example asked for ${item.synthetic_request_summary.toLocaleLowerCase()}.`,
        outcome: item.outcome,
        outcome_note: item.outcome_note,
      })),
  };
}

export function draftAppealDemo(originalRequestText: string, departmentName: string, daysElapsed: number): AppealResult {
  return {
    appeal_letter_text: [
      `To: The First Appellate Authority, ${departmentName}`,
      "",
      "Subject: First Appeal under Section 19(1) of the Right to Information Act, 2005",
      "",
      `I submitted the RTI request reproduced below ${daysElapsed} days ago and have not received a response within the applicable period. I request that the authority direct the concerned officer to provide the requested records.`,
      "",
      "Original request:",
      originalRequestText,
      "",
      "Relief requested: Please provide the requested records and communicate the appeal decision to the applicant.",
    ].join("\n").slice(0, 3000),
    citizen_explanation: "The draft records that the reply window has passed, repeats your original request, and asks the senior reviewing authority to direct a response. Review every line before using it.",
  };
}
