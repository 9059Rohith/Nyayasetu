"use client";

import { Braces, ChevronDown } from "lucide-react";
import { t } from "@/lib/i18n";
import type { StepTrace } from "@/types/domain";
import type { Language } from "@/types/workflow";

export function TransparencyPanel({ language, trace }: { language: Language; trace: StepTrace<unknown, unknown> }) {
  return (
    <details className="group mt-4 rounded-xl border border-line bg-soft">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-extrabold">
        <span className="flex items-center gap-2"><Braces size={17} />{t(language, "generated")}</span>
        <span className="flex items-center gap-2 text-xs font-semibold text-muted"><span className={`h-2 w-2 rounded-full ${trace.mode === "openai" ? "bg-teal" : "bg-saffron"}`} />{trace.mode === "openai" ? t(language, "openaiMode") : t(language, "demoMode")}<ChevronDown className="transition-transform group-open:rotate-180" size={17} /></span>
      </summary>
      <div className="grid gap-px border-t border-line bg-line md:grid-cols-2">
        <div className="bg-white p-4"><p className="mb-2 text-xs font-black uppercase tracking-wider text-muted">Structured input · Step {trace.step}</p><pre className="overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-ink">{JSON.stringify(trace.input, null, 2)}</pre></div>
        <div className="bg-white p-4"><p className="mb-2 text-xs font-black uppercase tracking-wider text-muted">Strict JSON output · {trace.functionName}</p><pre className="overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-ink">{JSON.stringify(trace.output, null, 2)}</pre></div>
      </div>
    </details>
  );
}
