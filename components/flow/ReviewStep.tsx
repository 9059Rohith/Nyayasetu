"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, BadgeIndianRupee, Check, FileUp, LoaderCircle, MapPin, ShieldCheck } from "lucide-react";
import { getDepartment } from "@/lib/routing";
import { t } from "@/lib/i18n";
import type { Language } from "@/types/workflow";

export function ReviewStep({ language, departmentId, compliantRequest, requestedRecords, pinCode, isBpl, bplFileName, paid, onBplChange, onBplFile, onPaid, onBack, onSubmit }: {
  language: Language;
  departmentId: string;
  compliantRequest: string;
  requestedRecords: string[];
  pinCode: string;
  isBpl: boolean;
  bplFileName: string;
  paid: boolean;
  onBplChange: (value: boolean) => void;
  onBplFile: (name: string) => void;
  onPaid: () => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const department = getDepartment(departmentId);
  const [paying, setPaying] = useState(false);
  const pay = () => {
    setPaying(true);
    window.setTimeout(() => { setPaying(false); onPaid(); }, 1500);
  };
  const canSubmit = isBpl ? Boolean(bplFileName) : paid;
  return (
    <section className="mx-auto max-w-5xl" aria-labelledby="review-title">
      <button className="text-button mb-4" onClick={onBack}><ArrowLeft size={18} />{t(language, "back")}</button>
      <div className="mb-7"><h1 id="review-title" tabIndex={-1} className="font-display text-4xl font-bold sm:text-5xl">{t(language, "reviewTitle")}</h1><p className="mt-3 max-w-2xl leading-7 text-muted">Check every word. This prototype prepares an application but does not file it.</p></div>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-5">
          <article className="primary-frame p-5 sm:p-7"><p className="text-xs font-black uppercase tracking-wider text-saffron">{t(language, "department")}</p><h2 className="mt-2 font-display text-2xl font-bold">{department.name}</h2><p className="mt-3 font-semibold">{t(language, "officer")}</p><p className="mt-1 text-sm text-muted">{department.pio_name}</p><p className="mt-1 text-sm text-muted">{department.mock_address}</p>{pinCode ? <p className="mt-4 flex items-start gap-2 rounded-lg bg-soft p-3 text-sm leading-6 text-muted"><MapPin className="mt-1 shrink-0" size={17} />PIN {pinCode} was used only to suggest this synthetic office. No location data was sent outside this app.</p> : null}</article>
          <article className="primary-frame p-5 sm:p-7"><h2 className="font-display text-2xl font-bold">{t(language, "finalRequest")}</h2><pre className="mt-4 whitespace-pre-wrap rounded-xl border border-line bg-soft p-4 font-sans text-sm leading-7">{compliantRequest}</pre><h3 className="mt-6 font-bold">{t(language, "recordsList")}</h3><ol className="mt-3 space-y-2 text-sm leading-6">{requestedRecords.map((record, index) => <li key={record} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-soft text-xs font-black text-teal">{index + 1}</span>{record}</li>)}</ol></article>
        </div>
        <aside className="primary-frame h-fit p-5 sm:p-7" aria-labelledby="fee-title">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-saffron-soft text-saffron"><BadgeIndianRupee size={23} /></span><div><h2 id="fee-title" className="font-display text-2xl font-bold">{t(language, "fee")}</h2><p className="text-2xl font-black">₹10</p></div></div>
          <p className="mt-4 rounded-lg bg-soft p-3 text-sm leading-6 text-muted">{t(language, "paymentMock")}</p>
          <label className="mt-5 flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-line p-3 font-bold"><input className="mt-1 h-5 w-5 accent-saffron" type="checkbox" checked={isBpl} onChange={(event) => onBplChange(event.target.checked)} /><span>{t(language, "bpl")}</span></label>
          {isBpl ? <div className="mt-4"><label className="field-label" htmlFor="bpl-file"><FileUp size={17} />{t(language, "bplUpload")}</label><input id="bpl-file" type="file" accept="image/*" className="field file:mr-3 file:rounded-md file:border-0 file:bg-ink file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" onChange={(event) => onBplFile(event.target.files?.[0]?.name ?? "")} />{bplFileName ? <p className="mt-2 flex items-center gap-2 text-sm font-bold text-teal"><Check size={17} />{bplFileName}</p> : null}</div> : <button type="button" className={`primary-button mt-5 w-full ${paid ? "!bg-teal" : ""}`} disabled={paying || paid} onClick={pay}>{paying ? <><LoaderCircle className="animate-spin" size={18} />{t(language, "paying")}</> : paid ? <><Check size={18} />{t(language, "paid")}</> : <>{t(language, "pay")}<ArrowRight size={18} /></>}</button>}
          <div className="mt-6 border-t border-line pt-5"><button className="primary-button w-full" disabled={!canSubmit} onClick={onSubmit}><ShieldCheck size={19} />{t(language, "submit")}</button>{!canSubmit ? <p className="mt-3 text-center text-xs leading-5 text-muted">Complete the demo payment or add a mock BPL image to continue.</p> : null}</div>
        </aside>
      </div>
    </section>
  );
}
