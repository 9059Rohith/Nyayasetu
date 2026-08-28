import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { t } from "@/lib/i18n";
import type { RiskResult } from "@/types/domain";
import type { Language } from "@/types/workflow";

export function RiskPanel({ language, risk, accepted, onAcceptedChange }: { language: Language; risk: RiskResult; accepted: boolean; onAcceptedChange: (value: boolean) => void }) {
  if (risk.overall_risk === "low") return <div className="rounded-xl border border-teal/30 bg-teal-soft p-4 text-teal"><p className="flex items-center gap-2 font-extrabold"><CheckCircle2 size={20} />{t(language, "riskLow")}</p></div>;
  return (
    <div className="rounded-xl border border-risk/30 bg-risk-soft p-5 text-risk">
      <h3 className="flex items-center gap-2 font-display text-xl font-bold"><AlertTriangle size={22} />{t(language, "riskWarning")}</h3>
      <ul className="mt-4 space-y-4">
        {risk.risk_flags.map((flag, index) => <li key={`${flag.clause}-${index}`} className="rounded-lg bg-white p-4 text-sm leading-6 text-ink"><p className="font-black">Risk {flag.clause}</p><p className="mt-1">{flag.explanation}</p><p className="mt-2 font-semibold text-teal">Suggested fix: {flag.suggestion}</p></li>)}
      </ul>
      {risk.overall_risk === "high" ? <label className="mt-4 flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-risk/30 bg-white p-3 font-bold text-ink"><input type="checkbox" className="mt-1 h-5 w-5 accent-saffron" checked={accepted} onChange={(event) => onAcceptedChange(event.target.checked)} /><span>{t(language, "acknowledge")}</span></label> : null}
    </div>
  );
}
