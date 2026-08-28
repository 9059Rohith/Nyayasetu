"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { t } from "@/lib/i18n";
import { validateOtp, validatePhone } from "@/lib/validation";
import type { Language } from "@/types/workflow";

export function LoginStep({ language, phone, otp, onChange, onBack, onAuthenticated }: {
  language: Language;
  phone: string;
  otp: string;
  onChange: (field: "phone" | "otp", value: string) => void;
  onBack: () => void;
  onAuthenticated: (phone: string, otp: string) => void;
}) {
  const [localPhone, setLocalPhone] = useState(phone);
  const [localOtp, setLocalOtp] = useState(otp);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const update = (field: "phone" | "otp", value: string) => {
    if (field === "phone") setLocalPhone(value); else setLocalOtp(value);
    onChange(field, value);
  };
  const send = () => {
    const result = validatePhone(localPhone);
    if (!result.ok) return setError(result.message);
    setError(""); setOtpSent(true);
  };
  const verify = () => {
    const phoneResult = validatePhone(localPhone);
    const otpResult = validateOtp(localOtp);
    if (!phoneResult.ok) return setError(phoneResult.message);
    if (!otpResult.ok) return setError(otpResult.message);
    setError(""); onAuthenticated(phoneResult.value, otpResult.value);
  };
  return (
    <section className="mx-auto max-w-3xl" aria-labelledby="login-title">
      <div className="grid overflow-hidden rounded-2xl border border-line bg-white shadow-frame md:grid-cols-[1.15fr_.85fr]">
        <div className="p-6 sm:p-10">
          <button className="text-button mb-7" onClick={onBack}><ArrowLeft size={18} />{t(language, "back")}</button>
          <h1 id="login-title" tabIndex={-1} className="font-display text-3xl font-bold sm:text-4xl">{t(language, "mockLogin")}</h1>
          <p className="mt-3 leading-7 text-muted">{t(language, "loginHelp")}</p>
          <div className="mt-7"><label className="field-label" htmlFor="phone">{t(language, "phone")}</label><div className="flex"><span className="grid min-h-12 place-items-center rounded-l-xl border border-r-0 border-line bg-soft px-3 font-semibold">+91</span><input id="phone" className="field rounded-l-none" inputMode="numeric" maxLength={10} value={localPhone} onChange={(event) => update("phone", event.target.value.replace(/\D/g, ""))} /></div></div>
          <p className="mt-3 rounded-lg bg-saffron-soft px-4 py-3 text-sm font-bold text-ink">{t(language, "demoPhone")}</p>
          <p className="mt-3 rounded-lg bg-teal-soft px-4 py-3 text-sm font-bold text-teal">{t(language, "demoOtp")}</p>
          {!otpSent ? <button className="primary-button mt-6 w-full" onClick={send}>{t(language, "sendOtp")}<ArrowRight size={18} /></button> : <div className="mt-6"><label className="field-label" htmlFor="otp">{t(language, "otp")}</label><input id="otp" className="field tracking-[.35em]" inputMode="numeric" maxLength={6} value={localOtp} onChange={(event) => update("otp", event.target.value.replace(/\D/g, ""))} /><button className="primary-button mt-5 w-full" onClick={verify}>{t(language, "verify")}<ArrowRight size={18} /></button></div>}
          {error ? <p role="alert" className="mt-4 text-sm font-semibold text-risk">{error}</p> : null}
        </div>
        <div className="flex flex-col items-center justify-center border-t border-line bg-soft p-8 text-center md:border-l md:border-t-0">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-ink shadow-sm"><LockKeyhole size={34} /></div>
          <p className="mt-5 font-bold">MOCK LOGIN</p>
          <p className="mt-2 text-sm leading-6 text-muted">No OTP is sent. No identity is checked. The number stays in this browser demo.</p>
        </div>
      </div>
    </section>
  );
}
