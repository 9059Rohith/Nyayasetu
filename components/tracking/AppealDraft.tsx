import { FileText } from "lucide-react";
import { TransparencyPanel } from "@/components/TransparencyPanel";
import { t } from "@/lib/i18n";
import type { AppealResult, StepTrace } from "@/types/domain";
import type { Language } from "@/types/workflow";

export function AppealDraft({ language, appeal, trace }: { language: Language; appeal: AppealResult; trace: StepTrace<unknown, unknown> }) {
  return <section className="mt-7 rounded-2xl border border-line bg-white p-5 shadow-frame sm:p-7" aria-labelledby="appeal-title"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-saffron-soft text-saffron"><FileText /></span><h2 id="appeal-title" className="font-display text-2xl font-bold">{t(language, "appealTitle")}</h2></div><p className="mt-4 rounded-xl bg-saffron-soft p-4 leading-7">{appeal.citizen_explanation}</p><pre className="mt-5 whitespace-pre-wrap rounded-xl border border-line bg-soft p-4 font-sans text-sm leading-7">{appeal.appeal_letter_text}</pre><TransparencyPanel language={language} trace={trace} /></section>;
}
