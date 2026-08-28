import { CalendarDays, CheckCircle2, Download, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { t } from "@/lib/i18n";
import type { StoredApplication } from "@/types/domain";
import type { Language } from "@/types/workflow";

export function ConfirmationStep({ language, application, onDownload, onTrack, onStartOver }: { language: Language; application: StoredApplication; onDownload: () => void; onTrack: () => void; onStartOver: () => void }) {
  return (
    <section className="mx-auto max-w-4xl text-center" aria-labelledby="confirmation-title">
      <CheckCircle2 className="mx-auto text-teal" size={58} strokeWidth={1.7} />
      <h1 id="confirmation-title" tabIndex={-1} className="mt-5 font-display text-4xl font-bold sm:text-6xl">{t(language, "prepared")}</h1>
      <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted">{t(language, "confirmationHelp")}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-dashed border-teal bg-teal-soft p-5"><p className="text-xs font-black uppercase tracking-wider text-muted">{t(language, "trackingId")}</p><p className="mt-2 font-display text-2xl font-bold tracking-wide">{application.tracking_id}</p></div>
        <div className="rounded-xl border border-dashed border-teal bg-teal-soft p-5"><p className="text-xs font-black uppercase tracking-wider text-muted">{t(language, "accessCode")}</p><p className="mt-2 font-display text-2xl font-bold tracking-[.2em]">{application.access_code}</p></div>
      </div>
      <div className="mt-4 grid gap-4 text-left sm:grid-cols-2"><div className="flex gap-3 rounded-xl border border-line p-5"><CalendarDays className="shrink-0 text-saffron" /><div><p className="font-black">{t(language, "replyWindow")}</p><p className="mt-1 text-sm text-muted">{t(language, "days30")}</p></div></div><div className="flex gap-3 rounded-xl border border-line p-5"><ShieldCheck className="shrink-0 text-teal" /><div><p className="font-black">Save and resume</p><p className="mt-1 text-sm text-muted">Keep both codes. This browser also stores the full synthetic application.</p></div></div></div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3"><button className="secondary-button" onClick={onDownload}><Download size={18} />{t(language, "download")}</button><button className="secondary-button" onClick={onTrack}><Search size={18} />{t(language, "trackCta")}</button><button className="primary-button" onClick={onStartOver}><RotateCcw size={18} />{t(language, "startOver")}</button></div>
    </section>
  );
}
