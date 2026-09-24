"use client";

const STORAGE_KEY = "gotur_campaign";
const FIRED_PREFIX = "gotur_event_fired_";
const INSTALL_DISMISS_KEY = "gotur_install_dismissed_at";

export type CampaignData = { ref: string; source: string | null };

export function readCampaign(): CampaignData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CampaignData) : null;
  } catch {
    return null;
  }
}

export function writeCampaign(data: CampaignData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage kapalıysa sessizce geç
  }
}

function hasFired(event: string, phone: string): boolean {
  try {
    return window.localStorage.getItem(FIRED_PREFIX + event + ":" + phone) === "1";
  } catch {
    return false;
  }
}

function markFired(event: string, phone: string) {
  try {
    window.localStorage.setItem(FIRED_PREFIX + event + ":" + phone, "1");
  } catch {
    // yut
  }
}

export async function trackEvent(
  event: string,
  phone: string,
  source?: string | null,
  opts?: { once?: boolean }
) {
  if (!phone) return;
  if (opts?.once && hasFired(event, phone)) return;
  try {
    await fetch("/api/events/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, event, source: source ?? null }),
    });
    if (opts?.once) markFired(event, phone);
  } catch {
    // Takip event'i kritik akışı bozmasın, sessizce yut.
  }
}

export function getInstallSnoozedUntil(): number {
  try {
    return Number(window.localStorage.getItem(INSTALL_DISMISS_KEY) ?? 0);
  } catch {
    return 0;
  }
}

export function snoozeInstallPrompt(hours = 24) {
  try {
    window.localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now() + hours * 60 * 60 * 1000));
  } catch {
    // yut
  }
}

/** "905551234567" veya "5551234567" -> "5551234567" (giriş formundaki 10 haneli yerel format) */
export function refToLocalPhone(ref: string): string {
  const digits = ref.replace(/[^0-9]/g, "");
  if (digits.length === 12 && digits.startsWith("90")) return digits.slice(2);
  if (digits.length === 10) return digits;
  return "";
}
