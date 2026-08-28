import { ArrowRight, FileStack } from "lucide-react";
import { t } from "@/lib/i18n";
import type { PrecedentMatch } from "@/types/domain";
import type { Language } from "@/types/workflow";

const outcomeLabel = { answered_in_full: "Answered in full", answered_partially: "Answered partly", rejected_with_reason: "Rejected with a reason", transferred: "Transferred" } as const;

export function PrecedentStrip({ language, precedents }: { language: Language; precedents: PrecedentMatch[] }) {
  return (
    <section aria-labelledby="similar-title">
      <div className="mb-4 flex items-center gap-2"><FileStack size={20} /><h2 id="similar-title" className="font-display text-2xl font-bold">{t(language, "similar")}</h2></div>
      <div className="grid gap-3 md:grid-cols-3">
        {precedents.map((item) => <article key={item.precedent_id} className="rounded-xl border border-line bg-white p-4 shadow-sm"><p className="text-[.68rem] font-black uppercase tracking-wider text-saffron">{t(language, "synthetic")}</p><p className="mt-3 text-sm font-bold leading-6">{item.similarity_reason}</p><div className="mt-4 border-t border-line pt-3"><p className="flex items-center gap-1 text-sm font-black text-teal">{outcomeLabel[item.outcome]}<ArrowRight size={15} /></p><p className="mt-2 text-xs leading-5 text-muted">{item.outcome_note}</p></div></article>)}
      </div>
    </section>
  );
}
