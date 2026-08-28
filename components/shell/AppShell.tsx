"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { t } from "@/lib/i18n";
import type { FlowStep, Language } from "@/types/workflow";

const steps: Array<{ key: FlowStep; en: string; hi: string }> = [
  { key: "landing", en: "Tell us", hi: "समस्या" },
  { key: "login", en: "Demo login", hi: "डेमो लॉगिन" },
  { key: "draft", en: "Draft", hi: "मसौदा" },
  { key: "review", en: "Review & fee", hi: "समीक्षा" },
  { key: "confirmation", en: "Prepared", hi: "तैयार" },
];

const stepIndex: Record<FlowStep, number> = { landing: 0, login: 1, draft: 2, review: 3, confirmation: 4, tracking: -1 };

export function AppShell({ language, onLanguageChange, step, children }: { language: Language; onLanguageChange: (language: Language) => void; step: FlowStep; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const active = stepIndex[step];
  return (
    <div className="min-h-screen bg-white text-ink">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="bridge-mark">N</span>
            <span className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">{t(language, "brand")}</span>
          </div>
          <div className="inline-flex rounded-lg border border-line p-1" aria-label="Language">
            <button className={`lang-button ${language === "en" ? "lang-button-active" : ""}`} onClick={() => onLanguageChange("en")} aria-pressed={language === "en"}>English</button>
            <button className={`lang-button ${language === "hi" ? "lang-button-active" : ""}`} onClick={() => onLanguageChange("hi")} aria-pressed={language === "hi"}>हिन्दी</button>
          </div>
        </div>
        {step !== "tracking" ? (
          <nav aria-label="Application progress" className="mx-auto max-w-4xl px-4 pb-4 pt-1 sm:px-6">
            <ol className="grid grid-cols-5">
              {steps.map((item, index) => (
                <li key={item.key} className={`progress-step ${index <= active ? "progress-step-active" : ""}`} aria-current={index === active ? "step" : undefined}>
                  <span>{index + 1}</span><small>{language === "en" ? item.en : item.hi}</small>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
      </header>
      <aside className="bg-ink text-white" aria-label="Prototype disclosure">
        <div className="mx-auto flex min-h-11 max-w-6xl items-start justify-between gap-3 px-4 py-2 text-xs leading-5 sm:px-6 sm:text-sm">
          <p className={collapsed ? "line-clamp-1" : ""}>{t(language, "disclosure")}</p>
          <button className="-my-1 grid min-h-11 min-w-11 shrink-0 place-items-center rounded-md focus-visible:outline-white" onClick={() => setCollapsed((value) => !value)} aria-expanded={!collapsed} aria-label={collapsed ? t(language, "expand") : t(language, "collapse")}>
            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </aside>
      <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
      <footer className="mx-auto max-w-6xl border-t border-line px-4 py-6 text-center text-xs leading-5 text-muted sm:px-6">
        {t(language, "saveNote")}
      </footer>
    </div>
  );
}
