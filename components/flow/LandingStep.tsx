"use client";

import { useEffect, useState } from "react";
import { ArrowRight, LocateFixed, Mic, Search } from "lucide-react";
import { t } from "@/lib/i18n";
import { validatePin } from "@/lib/validation";
import type { Language } from "@/types/workflow";

type Recognition = { lang: string; start: () => void; onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null };

export function LandingStep({ language, rawGrievance, pinCode, onChange, onProceed, onTrack, restored = false }: {
  language: Language;
  rawGrievance: string;
  pinCode: string;
  onChange: (field: "rawGrievance" | "pinCode", value: string) => void;
  onProceed: () => void;
  onTrack: () => void;
  restored?: boolean;
}) {
  const [grievance, setGrievance] = useState(rawGrievance);
  const [pin, setPin] = useState(pinCode);
  const [error, setError] = useState("");
  const [speechAvailable, setSpeechAvailable] = useState(false);
  useEffect(() => {
    // Feature detection is browser-only; deferring it prevents server/client markup drift.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSpeechAvailable(typeof window !== "undefined" && Boolean((window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition));
  }, []);

  const update = (field: "rawGrievance" | "pinCode", value: string) => {
    if (field === "rawGrievance") setGrievance(value); else setPin(value);
    onChange(field, value);
  };

  const submit = () => {
    if (grievance.trim().length < 20) return setError("Tell us at least a few details so we can prepare a useful request.");
    const pinResult = validatePin(pin);
    if (!pinResult.ok) return setError(pinResult.message);
    setError("");
    onProceed();
  };

  const startVoice = () => {
    const scope = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const RecognitionClass = scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
    if (!RecognitionClass) return;
    const recognition = new RecognitionClass();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.onresult = (event) => update("rawGrievance", event.results[0]?.[0]?.transcript ?? grievance);
    recognition.start();
  };

  return (
    <section className="mx-auto max-w-4xl" aria-labelledby="landing-title">
      {restored ? <div className="mb-5 rounded-xl border border-teal/30 bg-teal-soft px-4 py-3 text-sm font-semibold text-teal">{t(language, "savedDraft")}</div> : null}
      <div className="mb-8 max-w-3xl">
        <h1 id="landing-title" tabIndex={-1} className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">{t(language, "tellUs")}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{t(language, "tagline")}</p>
      </div>
      <div className="primary-frame p-5 sm:p-8">
        <label htmlFor="grievance" className="field-label">{t(language, "grievanceLabel")}</label>
        <p className="mb-3 text-sm text-muted">{t(language, "tellUsHelp")}</p>
        <textarea id="grievance" value={grievance} onChange={(event) => update("rawGrievance", event.target.value)} maxLength={3000} rows={8} className="field resize-y text-base leading-7" placeholder={t(language, "grievancePlaceholder")} />
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted"><span>{grievance.length}/3000</span>{speechAvailable ? <button type="button" className="secondary-button min-h-11" onClick={startVoice}><Mic size={18} /> {language === "en" ? "Speak instead" : "बोलकर लिखें"}</button> : null}</div>
        <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div><label className="field-label" htmlFor="pin"><LocateFixed size={16} /> {t(language, "pinLabel")}</label><input id="pin" className="field" inputMode="numeric" maxLength={6} value={pin} onChange={(event) => update("pinCode", event.target.value.replace(/\D/g, ""))} placeholder="500032" /><p className="mt-2 text-xs leading-5 text-muted">{t(language, "pinHelp")}</p></div>
          <button type="button" className="secondary-button" onClick={onTrack}><Search size={18} />{t(language, "trackCta")}</button>
        </div>
        {error ? <p role="alert" className="mt-4 rounded-lg bg-risk-soft px-4 py-3 text-sm font-semibold text-risk">{error}</p> : null}
        <div className="mt-7 flex justify-end"><button type="button" className="primary-button w-full sm:w-auto" onClick={submit}>{t(language, "primaryCta")}<ArrowRight size={19} /></button></div>
      </div>
    </section>
  );
}
