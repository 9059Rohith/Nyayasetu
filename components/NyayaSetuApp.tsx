"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CircleHelp, LoaderCircle } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { LandingStep } from "@/components/flow/LandingStep";
import { LoginStep } from "@/components/flow/LoginStep";
import { DraftingStep } from "@/components/flow/DraftingStep";
import { ReviewStep } from "@/components/flow/ReviewStep";
import { ConfirmationStep } from "@/components/flow/ConfirmationStep";
import { Tracker } from "@/components/tracking/Tracker";
import { createApplication, saveApplication } from "@/lib/applications";
import { downloadApplicationPdf } from "@/lib/pdf";
import { getDepartment } from "@/lib/routing";
import { clearDraft, loadDraft, saveDraft } from "@/lib/storage";
import { createInitialDraft } from "@/lib/workflow";
import type {
  ClassificationResult,
  PrecedentResult,
  RiskResult,
  StepResponse,
  SubjectCategory,
  TranslationResult,
} from "@/types/domain";
import type { DraftState, Language } from "@/types/workflow";

async function postStructured<TInput, TOutput>(path: string, input: TInput): Promise<StepResponse<TInput, TOutput>> {
  const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "The structured check could not run." })) as { error?: string };
    throw new Error(body.error || "The structured check could not run.");
  }
  const body = await response.json() as StepResponse<TInput, TOutput>;
  console.info(`[Nyaya-Setu browser trace][Step ${body.trace.step}]`, body.trace);
  return body;
}

export function NyayaSetuApp() {
  const [draft, setDraft] = useState<DraftState>(createInitialDraft);
  const [hydrated, setHydrated] = useState(false);
  const [restored, setRestored] = useState(false);
  const [loading, setLoading] = useState(false);
  const [screening, setScreening] = useState(false);
  const [error, setError] = useState("");
  const [clarifying, setClarifying] = useState(false);
  const screenedText = useRef("");

  useEffect(() => {
    const saved = loadDraft();
    // Draft hydration intentionally happens after mount so server and first client markup match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) { setDraft(saved); setRestored(Boolean(saved.rawGrievance)); }
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) saveDraft(draft); }, [draft, hydrated]);

  const patchDraft = (patch: Partial<DraftState>) => setDraft((current) => ({ ...current, ...patch }));
  const runScreenAndPrecedents = async (category: SubjectCategory, compliantRequest: string) => {
    const [riskResponse, precedentResponse] = await Promise.all([
      postStructured<{ compliant_request_text: string; subject_category: SubjectCategory }, RiskResult>("/api/screen", { compliant_request_text: compliantRequest, subject_category: category }),
      postStructured<{ compliant_request_text: string; subject_category: SubjectCategory }, PrecedentResult>("/api/precedents", { compliant_request_text: compliantRequest, subject_category: category }),
    ]);
    screenedText.current = compliantRequest;
    setDraft((current) => ({ ...current, risk: riskResponse.result, precedents: precedentResponse.result.precedents, traces: [...current.traces.filter((item) => item.step !== "C" && item.step !== "D"), riskResponse.trace, precedentResponse.trace], highRiskAccepted: false }));
  };

  const translateAndCheck = async (classification: ClassificationResult, rawGrievance: string) => {
    const department = getDepartment(classification.likely_department_id);
    const translation = await postStructured<{ raw_grievance: string; subject_category: SubjectCategory; department_name: string }, TranslationResult>("/api/translate", { raw_grievance: rawGrievance, subject_category: classification.subject_category, department_name: department.name });
    setDraft((current) => ({ ...current, compliantRequest: translation.result.compliant_request_text, citizenExplanation: translation.result.citizen_explanation, requestedRecords: translation.result.requested_records, traces: [...current.traces.filter((item) => item.step !== "B"), translation.trace] }));
    await runScreenAndPrecedents(classification.subject_category, translation.result.compliant_request_text);
  };

  const startPipeline = async (phone: string, otp: string) => {
    patchDraft({ phone, otp, step: "draft" });
    setLoading(true); setError("");
    try {
      const classification = await postStructured<{ raw_grievance: string; pin_code: string | null }, ClassificationResult>("/api/classify", { raw_grievance: draft.rawGrievance, pin_code: draft.pinCode || null });
      setDraft((current) => ({ ...current, phone, otp, step: "draft", category: classification.result.subject_category, departmentId: classification.result.likely_department_id, classification: classification.result, traces: [...current.traces.filter((item) => item.step !== "A"), classification.trace] }));
      if (classification.result.needs_clarification) { setClarifying(true); return; }
      await translateAndCheck(classification.result, draft.rawGrievance);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "We couldn’t prepare the draft. Try again."); }
    finally { setLoading(false); }
  };

  const submitClarification = async () => {
    if (!draft.classification || draft.clarificationAnswer.trim().length < 3) return setError("Add a short answer so we can route the request.");
    setLoading(true); setError(""); setClarifying(false);
    const raw = `${draft.rawGrievance}\nAdditional detail: ${draft.clarificationAnswer}`;
    try {
      const classification = await postStructured<{ raw_grievance: string; pin_code: string | null }, ClassificationResult>("/api/classify", { raw_grievance: raw, pin_code: draft.pinCode || null });
      const usable = classification.result.needs_clarification ? { ...classification.result, subject_category: "other" as const, likely_department_id: "dept_general_records", needs_clarification: false, clarifying_question: null } : classification.result;
      setDraft((current) => ({ ...current, rawGrievance: raw, category: usable.subject_category, departmentId: usable.likely_department_id, classification: usable, traces: [...current.traces.filter((item) => item.step !== "A"), { ...classification.trace, output: usable }] }));
      await translateAndCheck(usable, raw);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "We couldn’t continue from that answer."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!hydrated || draft.step !== "draft" || loading || clarifying || !draft.compliantRequest || !draft.category || draft.compliantRequest === screenedText.current) return;
    setScreening(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await postStructured<{ compliant_request_text: string; subject_category: SubjectCategory }, RiskResult>("/api/screen", { compliant_request_text: draft.compliantRequest, subject_category: draft.category as SubjectCategory });
        screenedText.current = draft.compliantRequest;
        setDraft((current) => ({ ...current, risk: response.result, highRiskAccepted: false, traces: [...current.traces.filter((item) => item.step !== "C"), response.trace] }));
        setError("");
      } catch { setError("The live risk check paused. Your edit is saved; try the check again."); }
      finally { setScreening(false); }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [draft.compliantRequest, draft.category, draft.step, hydrated, loading, clarifying]);

  const submitApplication = () => {
    const application = createApplication(draft);
    saveApplication(application);
    patchDraft({ application, step: "confirmation" });
    void fetch("/api/applications", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(application) }).catch(() => undefined);
  };

  const startOver = () => {
    const language = draft.language;
    clearDraft();
    setDraft({ ...createInitialDraft(), language });
    setRestored(false); setError(""); setClarifying(false); screenedText.current = "";
  };

  if (!hydrated) return <div className="grid min-h-screen place-items-center bg-white text-ink"><LoaderCircle className="animate-spin text-saffron" aria-label="Loading saved draft" /></div>;

  let content;
  if (draft.step === "landing") {
    content = <LandingStep language={draft.language} rawGrievance={draft.rawGrievance} pinCode={draft.pinCode} restored={restored} onChange={(field, value) => patchDraft({ [field]: value })} onProceed={() => patchDraft({ step: "login", phone: draft.phone || "9876543210" })} onTrack={() => patchDraft({ step: "tracking" })} />;
  } else if (draft.step === "login") {
    content = <LoginStep language={draft.language} phone={draft.phone || "9876543210"} otp={draft.otp} onChange={(field, value) => patchDraft({ [field]: value })} onBack={() => patchDraft({ step: "landing" })} onAuthenticated={startPipeline} />;
  } else if (draft.step === "tracking") {
    content = <Tracker language={draft.language} onBack={() => patchDraft({ step: draft.application ? "confirmation" : "landing" })} />;
  } else if (draft.step === "draft" && clarifying && draft.classification) {
    content = <section className="mx-auto max-w-2xl primary-frame p-6 sm:p-9" aria-labelledby="clarify-title"><button className="text-button mb-4" onClick={() => patchDraft({ step: "login" })}><ArrowLeft size={18} />Back</button><CircleHelp className="text-saffron" size={36} /><h1 id="clarify-title" className="mt-4 font-display text-3xl font-bold">One detail will help</h1><p className="mt-3 leading-7 text-muted">{draft.classification.clarifying_question}</p><label className="field-label mt-6" htmlFor="clarification">Your answer</label><input id="clarification" className="field" value={draft.clarificationAnswer} onChange={(event) => patchDraft({ clarificationAnswer: event.target.value })} />{error ? <p role="alert" className="mt-3 text-sm font-bold text-risk">{error}</p> : null}<button className="primary-button mt-5 w-full" onClick={submitClarification}>Continue<ArrowRight size={18} /></button></section>;
  } else if (draft.step === "draft") {
    content = <DraftingStep language={draft.language} rawGrievance={draft.rawGrievance} category={(draft.category || "other") as SubjectCategory} departmentId={draft.departmentId || "dept_general_records"} compliantRequest={draft.compliantRequest} explanation={draft.citizenExplanation} risk={draft.risk} precedents={draft.precedents} traces={draft.traces} loading={loading} screening={screening} error={error} highRiskAccepted={draft.highRiskAccepted} onDepartmentChange={(departmentId) => patchDraft({ departmentId })} onDraftChange={(compliantRequest) => patchDraft({ compliantRequest, highRiskAccepted: false })} onRiskAcceptedChange={(highRiskAccepted) => patchDraft({ highRiskAccepted })} onRetry={() => startPipeline(draft.phone, draft.otp)} onBack={() => patchDraft({ step: "login" })} onContinue={() => patchDraft({ step: "review" })} />;
  } else if (draft.step === "review") {
    content = <ReviewStep language={draft.language} departmentId={draft.departmentId} compliantRequest={draft.compliantRequest} requestedRecords={draft.requestedRecords} pinCode={draft.pinCode} isBpl={draft.isBpl} bplFileName={draft.bplFileName} paid={draft.paid} onBplChange={(isBpl) => patchDraft({ isBpl, paid: false, bplFileName: "" })} onBplFile={(bplFileName) => patchDraft({ bplFileName })} onPaid={() => patchDraft({ paid: true })} onBack={() => patchDraft({ step: "draft" })} onSubmit={submitApplication} />;
  } else {
    content = draft.application ? <ConfirmationStep language={draft.language} application={draft.application} onDownload={() => void downloadApplicationPdf(draft.application!, getDepartment(draft.application!.department_id).name)} onTrack={() => patchDraft({ step: "tracking" })} onStartOver={startOver} /> : null;
  }

  return <AppShell language={draft.language} onLanguageChange={(language: Language) => patchDraft({ language })} step={draft.step}>{content}</AppShell>;
}
