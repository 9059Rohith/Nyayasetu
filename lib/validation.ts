export type ValidationResult = { ok: true; value: string } | { ok: false; message: string };

export function validatePhone(value: string): ValidationResult {
  const digits = value.replace(/\D/g, "");
  return /^\d{10}$/.test(digits)
    ? { ok: true, value: digits }
    : { ok: false, message: "Enter a 10-digit mobile number." };
}

export function validateOtp(value: string): ValidationResult {
  return /^\d{6}$/.test(value.trim())
    ? { ok: true, value: value.trim() }
    : { ok: false, message: "Enter any 6-digit demo code." };
}

export function validatePin(value: string): ValidationResult | { ok: true; value: null } {
  if (!value.trim()) return { ok: true, value: null };
  return /^\d{6}$/.test(value.trim())
    ? { ok: true, value: value.trim() }
    : { ok: false, message: "Enter a 6-digit PIN code or leave it blank." };
}
