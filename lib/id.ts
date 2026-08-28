const ACCESS_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createTrackingId(random: () => number = Math.random): string {
  const suffix = Math.floor(random() * 1_000_000).toString().padStart(6, "0");
  return `RTI-2026-${suffix}`;
}

export function createAccessCode(random: () => number = Math.random): string {
  return Array.from({ length: 6 }, () => ACCESS_ALPHABET[Math.floor(random() * ACCESS_ALPHABET.length)]).join("");
}

export function createInternalId(random: () => number = Math.random): string {
  return `app_${Date.now().toString(36)}_${Math.floor(random() * 1_000_000).toString(36)}`;
}
