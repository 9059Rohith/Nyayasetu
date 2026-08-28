import { createAccessCode, createInternalId, createTrackingId } from "@/lib/id";
import type { StoredApplication } from "@/types/domain";
import type { DraftState } from "@/types/workflow";

export const APPLICATIONS_KEY = "nyaya-setu:applications:v1";

export function createApplication(draft: DraftState, random: () => number = Math.random, now = new Date()): StoredApplication {
  return {
    id: createInternalId(random),
    tracking_id: createTrackingId(random),
    access_code: createAccessCode(random),
    citizen_phone: draft.phone,
    raw_grievance: draft.rawGrievance,
    compliant_request_text: draft.compliantRequest,
    department_id: draft.departmentId,
    risk_flags: draft.risk?.risk_flags ?? [],
    precedents_shown: draft.precedents,
    requested_records: draft.requestedRecords,
    status: "submitted",
    created_at: now.toISOString(),
    days_elapsed_mock: 0,
    transferred: Boolean(draft.pinCode),
  };
}

export function seedOverdueApplication(): StoredApplication {
  return {
    id: "app_seed_overdue",
    tracking_id: "RTI-2026-OVER01",
    access_code: "SETU30",
    citizen_phone: "9876543210",
    raw_grievance: "The road repair records have not been provided.",
    compliant_request_text: "Please provide the sanctioned work order, inspection report, and expenditure statement for the road repair at Demo Ward 12.",
    department_id: "dept_municipal_roads",
    risk_flags: [],
    precedents_shown: [],
    requested_records: ["sanctioned work order", "inspection report", "expenditure statement"],
    status: "overdue",
    created_at: "2026-07-21T09:00:00.000Z",
    days_elapsed_mock: 38,
    transferred: true,
  };
}

export function loadApplications(): StoredApplication[] {
  if (typeof window === "undefined") return [seedOverdueApplication()];
  try {
    const parsed = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) ?? "[]") as StoredApplication[];
    const items = Array.isArray(parsed) ? parsed : [];
    return items.some((item) => item.tracking_id === "RTI-2026-OVER01") ? items : [seedOverdueApplication(), ...items];
  } catch {
    return [seedOverdueApplication()];
  }
}

export function saveApplication(application: StoredApplication): void {
  if (typeof window === "undefined") return;
  const items = loadApplications().filter((item) => item.tracking_id !== application.tracking_id);
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify([application, ...items]));
}

export function findApplication(trackingId: string, accessCode: string): StoredApplication | null {
  return loadApplications().find((item) => item.tracking_id.toUpperCase() === trackingId.trim().toUpperCase() && item.access_code.toUpperCase() === accessCode.trim().toUpperCase()) ?? null;
}
