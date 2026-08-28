"use client";

import { ArrowLeft, ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import { departments } from "@/lib/routing";
import { t } from "@/lib/i18n";
import { PrecedentStrip } from "@/components/PrecedentStrip";
import { RiskPanel } from "@/components/RiskPanel";
import { TransparencyPanel } from "@/components/TransparencyPanel";
import type { PrecedentMatch, RiskResult, StepTrace, SubjectCategory } from "@/types/domain";
import type { Language } from "@/types/workflow";

const categoryLabels: Record<SubjectCategory, string> = {
  roads_infrastructure: "Roads & infrastructure", municipal_sanitation: "Municipal sanitation", electricity_utility: "Electricity service", land_revenue: "Land & revenue", police_conduct: "Police records", education_scheme: "Education scheme", healthcare_scheme: "Healthcare scheme", welfare_pension: "Welfare & pension", other: "Other public records",
};

export function DraftingStep({ language, rawGrievance, category, departmentId, compliantRequest, explanation, risk, precedents, traces, loading, screening, error, highRiskAccepted, onDepartmentChange, onDraftChange, onRiskAcceptedChange, onRetry, onBack, onContinue }: {
  language: Language;
  rawGrievance: string;
  category: SubjectCategory;
  departmentId: string;
  compliantRequest: string;
  explanation: string;
  risk: RiskResult | null;
  precedents: PrecedentMatch[];
  traces: Array<StepTrace<unknown, unknown>>;
  loading: boolean;
  screening: boolean;
  error: string;
  highRiskAccepted: boolean;
  onDepartmentChange: (departmentId: string) => void;
  onDraftChange: (value: string) => void;
  onRiskAcceptedChange: (value: boolean) => void;
  onRetry: () => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const blocked = risk?.overall_risk === "high" && !highRiskAccepted;
  if (loading) return <section className="mx-auto max-w-4xl py-20 text-center" aria-live="polite"><RefreshCw className="mx-auto animate-spin text-saffron" size={36} /><h1 className="mt-6 font-display text-3xl font-bold">{t(language, "loading")}</h1><p className="mt-3 text-muted">No government system is being contacted. We’re preparing inspectable structured output.</p></section>;
  if (error && !compliantRequest) return <section className="mx-auto max-w-xl rounded-xl border border-risk/30 bg-risk-soft p-6 text-center"><h1 className="font-display text-2xl font-bold text-risk">We couldn’t prepare the draft</h1><p className="mt-3 text-muted">{error}</p><button className="primary-button mt-5" onClick={onRetry}><RefreshCw size={18} />{t(language, "retry")}</button></section>;
  return (
    <section className="mx-auto max-w-6xl" aria-labelledby="draft-title">
      <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><button className="text-button mb-3" onClick={onBack}><ArrowLeft size={18} />{t(language, "back")}</button><h1 id="draft-title" tabIndex={-1} className="font-display text-3xl font-bold sm:text-5xl">{t(language, "draftTitle")}</h1><p className="mt-3 max-w-3xl leading-7 text-muted">{t(language, "editHelp")}</p></div><div className="grid min-w-72 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2"><div><label className="field-label" htmlFor="category">{t(language, "category")}</label><input id="category" className="field bg-soft" readOnly value={categoryLabels[category]} /></div><div><label className="field-label" htmlFor="department">{t(language, "department")}</label><select id="department" className="field" value={departmentId} onChange={(event) => onDepartmentChange(event.target.value)}>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></div></div></div>
      {error ? <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-risk-soft px-4 py-3 text-sm font-semibold text-risk"><span>{error}</span><button className="secondary-button" onClick={onRetry}><RefreshCw size={17} />{t(language, "retry")}</button></div> : null}
      <div className="mb-5 rounded-xl border border-saffron/25 bg-saffron-soft p-5"><p className="flex items-center gap-2 font-black"><Sparkles size={19} className="text-saffron" />{t(language, "explanation")}</p><p className="mt-2 leading-7 text-ink">{explanation}</p></div>
      <div className="grid overflow-hidden rounded-2xl border border-line bg-line shadow-frame lg:grid-cols-2 lg:gap-px">
        <article className="bg-soft p-5 sm:p-7"><h2 className="font-display text-2xl font-bold">{t(language, "whatSaid")}</h2><p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted">Your words, unchanged</p><div className="mt-4 min-h-64 whitespace-pre-wrap rounded-xl border border-line bg-white p-4 text-sm leading-7">{rawGrievance}</div>{traces.find((trace) => trace.step === "A") ? <TransparencyPanel language={language} trace={traces.find((trace) => trace.step === "A")!} /> : null}</article>
        <article className="bg-white p-5 sm:p-7"><div className="flex items-end justify-between gap-3"><div><h2 className="font-display text-2xl font-bold">{t(language, "submitting")}</h2><p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted">Editable draft · {compliantRequest.length}/3000</p></div>{screening ? <span className="flex items-center gap-2 text-xs font-bold text-saffron"><RefreshCw className="animate-spin" size={15} />Checking edit</span> : null}</div><textarea aria-label={t(language, "submitting")} className="field mt-4 min-h-64 resize-y text-sm leading-7" maxLength={3000} value={compliantRequest} onChange={(event) => onDraftChange(event.target.value)} />{traces.find((trace) => trace.step === "B") ? <TransparencyPanel language={language} trace={traces.find((trace) => trace.step === "B")!} /> : null}</article>
      </div>
      <div className="mt-6">{risk ? <RiskPanel language={language} risk={risk} accepted={highRiskAccepted} onAcceptedChange={onRiskAcceptedChange} /> : null}{traces.find((trace) => trace.step === "C") ? <TransparencyPanel language={language} trace={traces.find((trace) => trace.step === "C")!} /> : null}</div>
      {precedents.length ? <div className="mt-9"><PrecedentStrip language={language} precedents={precedents} />{traces.find((trace) => trace.step === "D") ? <TransparencyPanel language={language} trace={traces.find((trace) => trace.step === "D")!} /> : null}</div> : null}
      <div className="mt-8 flex justify-end"><button className="primary-button w-full sm:w-auto" disabled={blocked || screening || !compliantRequest.trim()} onClick={onContinue}>{t(language, "reviewCta")}<ArrowRight size={18} /></button></div>
    </section>
  );
}
