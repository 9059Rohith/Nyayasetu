import type { DraftState } from "@/types/workflow";

export const STORAGE_KEY = "nyaya-setu:draft:v1";

function isDraft(value: unknown): value is DraftState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DraftState>;
  return candidate.version === 1 && typeof candidate.rawGrievance === "string" && typeof candidate.step === "string";
}

export function saveDraft(draft: DraftState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, draft }));
}

export function loadDraft(): DraftState | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as { version?: number; draft?: unknown } | null;
    return parsed?.version === 1 && isDraft(parsed.draft) ? parsed.draft : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
}
