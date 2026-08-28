import type { DraftState } from "@/types/workflow";

export function createInitialDraft(): DraftState {
  return {
    version: 1,
    language: "en",
    step: "landing",
    rawGrievance: "",
    pinCode: "",
    phone: "",
    otp: "",
    category: "",
    departmentId: "",
    classification: null,
    clarificationAnswer: "",
    compliantRequest: "",
    citizenExplanation: "",
    requestedRecords: [],
    risk: null,
    precedents: [],
    traces: [],
    highRiskAccepted: false,
    isBpl: false,
    bplFileName: "",
    paid: false,
    application: null,
  };
}
