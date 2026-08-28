import { Check, Clock3 } from "lucide-react";
import type { StoredApplication } from "@/types/domain";

export function StatusTimeline({ application }: { application: StoredApplication }) {
  const stages = [
    { label: "Submitted", detail: new Date(application.created_at).toLocaleDateString("en-IN"), active: true },
    ...(application.transferred ? [{ label: "Transferred to the correct records office", detail: "Mock transfer within 5 days", active: true }] : []),
    { label: "Awaiting reply", detail: "Statutory 30-day window", active: true },
    ...(application.status === "overdue" ? [{ label: "Reply overdue", detail: `${application.days_elapsed_mock} mock days elapsed`, active: true }] : []),
  ];
  return <ol className="mt-6 space-y-0">{stages.map((stage, index) => <li key={stage.label} className="relative flex gap-4 pb-7 last:pb-0"><span className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ${index === stages.length - 1 && application.status === "overdue" ? "bg-risk text-white" : "bg-teal text-white"}`}>{index === stages.length - 1 && application.status === "overdue" ? <Clock3 size={18} /> : <Check size={18} />}</span>{index < stages.length - 1 ? <span className="absolute left-[17px] top-9 h-full w-px bg-line" /> : null}<div className="pt-1"><p className={`font-black ${stage.label === "Reply overdue" ? "text-risk" : ""}`}>{stage.label}</p><p className="mt-1 text-sm text-muted">{stage.detail}</p></div></li>)}</ol>;
}
