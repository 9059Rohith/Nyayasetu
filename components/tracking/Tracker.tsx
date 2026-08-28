"use client";

import { useState } from "react";
import { ArrowLeft, FilePenLine, LoaderCircle, Search } from "lucide-react";
import { findApplication } from "@/lib/applications";
import { getDepartment } from "@/lib/routing";
import { t } from "@/lib/i18n";
import { StatusTimeline } from "@/components/tracking/StatusTimeline";
import { AppealDraft } from "@/components/tracking/AppealDraft";
import type { AppealResult, StepResponse, StoredApplication } from "@/types/domain";
import type { Language } from "@/types/workflow";

export function Tracker({ language, onBack }: { language: Language; onBack: () => void }) {
  const [trackingId, setTrackingId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [application, setApplication] = useState<StoredApplication | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [appeal, setAppeal] = useState<StepResponse<unknown, AppealResult> | null>(null);
  const search = () => {
    const found = findApplication(trackingId, accessCode);
    if (!found) { setApplication(null); setError("We could not find a matching demo request. Check both codes and try again."); return; }
    setError(""); setAppeal(null); setApplication(found);
  };
  const draftAppeal = async () => {
    if (!application) return;
    setLoading(true); setError("");
    const department = getDepartment(application.department_id);
    try {
      const response = await fetch("/api/appeal", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ original_request_text: application.compliant_request_text, department_name: department.name, days_elapsed: application.days_elapsed_mock }) });
      if (!response.ok) throw new Error("request failed");
      setAppeal(await response.json() as StepResponse<unknown, AppealResult>);
    } catch { setError("We couldn’t draft the appeal just now. Your tracking details are still safe; try again."); }
    finally { setLoading(false); }
  };
  return (
    <section className="mx-auto max-w-4xl" aria-labelledby="tracker-title">
      <button className="text-button mb-4" onClick={onBack}><ArrowLeft size={18} />{t(language, "back")}</button>
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="primary-frame h-fit p-5 sm:p-7"><h1 id="tracker-title" className="font-display text-3xl font-bold">{t(language, "trackerTitle")}</h1><p className="mt-3 text-sm leading-6 text-muted">{t(language, "trackerHelp")}</p><p className="mt-4 rounded-lg bg-saffron-soft p-3 text-sm font-black">Demo overdue request: RTI-2026-OVER01 / SETU30</p><div className="mt-6"><label className="field-label" htmlFor="tracking">{t(language, "trackingId")}</label><input id="tracking" className="field uppercase" value={trackingId} onChange={(event) => setTrackingId(event.target.value)} placeholder="RTI-2026-XXXXXX" /></div><div className="mt-4"><label className="field-label" htmlFor="access">{t(language, "accessCode")}</label><input id="access" className="field uppercase tracking-widest" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} /></div><button className="primary-button mt-5 w-full" onClick={search}><Search size={18} />{t(language, "findRequest")}</button>{error ? <p role="alert" className="mt-4 rounded-lg bg-risk-soft p-3 text-sm font-semibold text-risk">{error}</p> : null}</div>
        <div>{application ? <article className="primary-frame p-5 sm:p-7"><p className="text-xs font-black uppercase tracking-wider text-saffron">MOCK STATUS — no government system contacted</p><div className="mt-3 flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-3xl font-bold">{application.tracking_id}</h2><p className="mt-1 text-sm text-muted">{getDepartment(application.department_id).name}</p></div><span className={`rounded-lg px-3 py-2 text-sm font-black ${application.status === "overdue" ? "bg-risk-soft text-risk" : "bg-teal-soft text-teal"}`}>{application.status === "overdue" ? t(language, "overdue") : "Awaiting reply"}</span></div><StatusTimeline application={application} />{application.status === "overdue" ? <button className="primary-button mt-6 w-full" disabled={loading} onClick={draftAppeal}>{loading ? <><LoaderCircle className="animate-spin" size={18} />{t(language, "loading")}</> : <><FilePenLine size={18} />{t(language, "appeal")}</>}</button> : null}</article> : <div className="grid min-h-96 place-items-center rounded-2xl border border-dashed border-line bg-soft p-8 text-center text-muted"><div><Search className="mx-auto" size={35} strokeWidth={1.5} /><p className="mt-4 font-semibold">Your synthetic status timeline will appear here.</p></div></div>}</div>
      </div>
      {appeal ? <AppealDraft language={language} appeal={appeal.result} trace={appeal.trace} /> : null}
    </section>
  );
}
